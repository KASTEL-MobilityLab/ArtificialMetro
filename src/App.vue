<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from 'vue'
import TimelapseView from './view/TimelapseView.vue'
import FooterBar from './view/FooterBar.vue'
import ViewSwitcher from './view/ViewSwitcher.vue'
import { HistoryIcon, MapIcon, SignpostIcon } from 'lucide-vue-next'
import LiveView from './view/LiveView.vue'
import { SwitchBus } from './view/switch_bus'
import StartupView from './view/StartupView.vue'
import { Kiosk } from './model/kiosk'
import MultiDeparturesView from './view/MultiDeparturesView.vue'
import OnlineIndicator from './view/OnlineIndicator.vue'
import { BaseStore } from './storage/base_store'
import { BaseRepo } from './model/repos'
import type { TramDeparture } from './model/vehicles'

const KIOSK_INTERVAL = 45 * 1000 /*45s*/
const CHECK_AVAILABILITY_INTERVAL = 5 * 60 * 1000 /*5min*/

type View = { title: string, icon: any, component: any, bus: SwitchBus }

const kiosk = new Kiosk(KIOSK_INTERVAL)
const views: View[] = [
  { title: "Live", icon: MapIcon, component: LiveView },
  { title: "Timelapse", icon: HistoryIcon, component: TimelapseView },
  { title: "Departures", icon: SignpostIcon, component: MultiDeparturesView },
].map(view => {
  return { ...view, bus: new SwitchBus() }
})
const loading = ref(true)
const activeView = ref(0)
const viewComponent = computed(() => views[activeView.value]?.component)
const currentSwitchBus = computed(() => views[activeView.value]?.bus?.getReceiver())
const disabledViews: Ref<number[]> = ref([])

watch(() => loading.value, (loading) => {
  if (!loading) {
    activeView.value = 0
    kiosk.start()
  }
})

onMounted(() => {
  registerKeyboardSwitcher()
  checkAvailability()
  setInterval(checkAvailability, CHECK_AVAILABILITY_INTERVAL)
})

kiosk.onTick(nextView)
function nextView() {
  let nextView = (activeView.value + 1) % views.length
  while (contains(nextView, disabledViews.value)) {
    nextView = (nextView + 1) % views.length
  }
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

function contains<T>(value: T, list: T[]): boolean {
  for (const item of list) {
    if (item == value) {
      return true
    }
  }
  return false
}

function checkAvailability() {
  checkTimelapseAvailability().then(available => {
    if (!available) {
      disabledViews.value.push(1)
    } else {
      disabledViews.value = disabledViews.value.filter(v => v != 1)
    }
  })
  checkDeparturesAvailability().then(available => {
    if (!available) {
      disabledViews.value.push(2)
    } else {
      disabledViews.value = disabledViews.value.filter(v => v != 2)
    }
  })
}

async function checkTimelapseAvailability(): Promise<boolean> {
  const store = await BaseStore.open()
  const repos = []
  repos.push(store.repo(BaseRepo.CarsharingStations))
  repos.push(store.repo(BaseRepo.Scooters))
  repos.push(store.repo(BaseRepo.Bikes))

  for (const repo of repos) {
    const availableTimestamps = await repo.getAvailableTimestamps()
    if (availableTimestamps.length > 12) {
      return true
    }
  }
  return false
}

async function checkDeparturesAvailability(): Promise<boolean> {
  const store = await BaseStore.open()
  const repo = store.repo<TramDeparture>(BaseRepo.TramDepartures)
  return !(await repo.isEmpty())
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
      <ViewSwitcher :views="views" :active="activeView" :automatic="kiosk.active.value" :disabled-views="disabledViews"
        @switch="manuallySwitchToView"></ViewSwitcher>
    </template>
  </FooterBar>

  <OnlineIndicator></OnlineIndicator>
</template>

<style scoped></style>
