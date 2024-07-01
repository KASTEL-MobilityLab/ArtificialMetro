<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import TimelapseView from './view/TimelapseView.vue'
import FooterBar from './view/FooterBar.vue'
import ViewSwitcher from './view/ViewSwitcher.vue'
import { MapIcon, TimerIcon } from 'lucide-vue-next'
import LiveView from './view/LiveView.vue'
import { SwitchBus } from './view/switch_bus'
import { TileProvider } from './view/map/tile_provider'
import StartupView from './view/StartupView.vue'

const KIOSK_INTERVAL = 30 * 1000 /*30s*/

type View = {title: string, icon: any, component: any, bus: SwitchBus }

const views: View[] = [
  { title: "Live", icon: MapIcon, component: LiveView },
  { title: "Timelapse", icon: TimerIcon, component: TimelapseView },
].map(view => {
  return { ...view, bus: new SwitchBus() }
})
const loading = ref(true)
const activeView = ref(0)
const viewComponent = computed(() => views[activeView.value]?.component)
const currentSwitchBus = computed(() => views[activeView.value]?.bus?.getReceiver())
const kioskMode = ref(false)
let kioskModeTicker: NodeJS.Timeout | undefined = undefined

watch(() => loading.value, (loading) => {
  if (!loading) {
    activeView.value = 0
  }
})

onMounted(() => {
  registerKeyboardSwitcher()
  startKioskMode()
})

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
function nextView() {
  const nextView = (activeView.value + 1) % views.length
  switchView(nextView)
}

function registerKeyboardSwitcher() {
  window.addEventListener('keyup', evt => {
    if (!evt.key.match(/[0-9]/)) return
    if (evt.key == "0") {
      // toggle automatic kiosk mode
      toggleKioskMode()
    } else {
      // switchView is 0-indexed,
      // but key 0 is used for kiosk mode, therefore, we start at key 1
      const view = parseInt(evt.key) - 1
      stopKioskMode()

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

function toggleKioskMode() {
  if (kioskMode.value) {
    stopKioskMode()
  } else {
    startKioskMode()
  }
}
function startKioskMode() {
  if (kioskMode.value) return
  kioskMode.value = true
  kioskModeTicker = globalThis.setInterval(nextView, KIOSK_INTERVAL)
}
function stopKioskMode() {
  if (!kioskMode.value) return
  globalThis.clearInterval(kioskModeTicker)
  kioskMode.value = false
}

</script>

<template>
  <FooterBar>
    <template #left>
      <ViewSwitcher :views="views" :active="activeView" :automatic="kioskMode" @switch="switchView"></ViewSwitcher>
    </template>
  </FooterBar>

  <main>
    <KeepAlive>
      <component :is="viewComponent" :bus="currentSwitchBus"></component>
    </KeepAlive>

    <StartupView v-if="loading" @ready="loading = false"></StartupView>
  </main>
</template>

<style scoped></style>
