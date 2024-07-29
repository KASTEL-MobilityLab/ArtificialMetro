<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import TimelapseView from './view/TimelapseView.vue'
import FooterBar from './view/FooterBar.vue'
import ViewSwitcher from './view/ViewSwitcher.vue'
import { MapIcon, TimerIcon, TramFrontIcon } from 'lucide-vue-next'
import LiveView from './view/LiveView.vue'
import { SwitchBus } from './view/switch_bus'
import StartupView from './view/StartupView.vue'
import { Kiosk } from './model/kiosk'
import MultiDeparturesView from './view/MultiDeparturesView.vue'
import OnlineIndicator from './view/OnlineIndicator.vue'

const KIOSK_INTERVAL = 45 * 1000 /*45s*/

type View = {title: string, icon: any, component: any, bus: SwitchBus }

const kiosk = new Kiosk(KIOSK_INTERVAL)
const views: View[] = [
  { title: "Live", icon: MapIcon, component: LiveView },
  { title: "Timelapse", icon: TimerIcon, component: TimelapseView },
  { title: "Departures", icon: TramFrontIcon, component: MultiDeparturesView },
].map(view => {
  return { ...view, bus: new SwitchBus() }
})
const loading = ref(true)
const activeView = ref(0)
const viewComponent = computed(() => views[activeView.value]?.component)
const currentSwitchBus = computed(() => views[activeView.value]?.bus?.getReceiver())

watch(() => loading.value, (loading) => {
  if (!loading) {
    activeView.value = 0
    kiosk.start()
  }
})

onMounted(() => {
  registerKeyboardSwitcher()
})

kiosk.onTick(nextView)
function nextView() {
  const nextView = (activeView.value + 1) % views.length
  switchView(nextView)
}

function getView(id: number): View | undefined {
  return views[id]
}

watch(() => activeView.value, (next, old) => {
  const oldView = getView(old)
  const nextView = getView(next)
  oldView?.bus?.suspend()
  nextView?.bus?.resume()
})

function switchView(view: number) {
  if (view >= views.length) return
  activeView.value = view
}


function registerKeyboardSwitcher() {
  window.addEventListener('keyup', evt => {
    if (!evt.key.match(/^[0-9]$/)) return
    if (evt.key == "0") {
      // toggle automatic kiosk mode
      kiosk.toggle()
    } else {
      // switchView is 0-indexed,
      // but key 0 is used for kiosk mode, therefore, we start at key 1
      const view = parseInt(evt.key) - 1
      kiosk.stop()

      if (activeView.value == view) {
        switchPresetForView(view)
      } else {
        switchView(view)
      }
    }
  })
}

function switchPresetForView(view: number) {
  views[view].bus.nextPreset()
}

function manuallySwitchToView(view: number) {
  kiosk.stop()
  switchView(view)
}

</script>

<template>
  <main>
    <KeepAlive>
      <component :is="viewComponent" :bus="currentSwitchBus"></component>
    </KeepAlive>

    <StartupView v-if="loading" @ready="loading = false"></StartupView>
  </main>

  <FooterBar>
    <template #left>
      <ViewSwitcher :views="views" :active="activeView" :automatic="kiosk.active.value" @switch="manuallySwitchToView"></ViewSwitcher>
    </template>
  </FooterBar>

  <OnlineIndicator></OnlineIndicator>
</template>

<style scoped></style>
