<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TimelapseView from './view/TimelapseView.vue'
import FooterBar from './view/FooterBar.vue'
import * as provider from './provider/provider'
import ViewSwitcher from './view/ViewSwitcher.vue';
import { MapIcon, TimerIcon } from 'lucide-vue-next';
import DebugView from './view/DebugView.vue';

const KIOSK_INTERVAL = 15 * 1000 /*15s*/

const views = [
    { title: "Map", icon: MapIcon, component: DebugView },
    { title: "Timelapse", icon: TimerIcon, component: TimelapseView },
]
const activeView = ref(0)
const viewComponent = computed(() => views[activeView.value].component)
const kioskMode = ref(false)
let kioskModeTicker: number | undefined = undefined

onMounted(() => {
  provider.startAll()
  registerKeyboardSwitcher()
  startKioskMode()
})

function switchView(view: number) {
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
      // enter automatic kiosk mode
      startKioskMode()
    } else {
      // switchView is 0-indexed,
      // but key 0 is special, therefore, we start at key 1
      stopKioskMode()
      switchView(parseInt(evt.key) - 1)
    }
  })
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
      <ViewSwitcher 
        :views="views" 
        :active="activeView" 
        @switch="switchView"
        ></ViewSwitcher>
    </template>
  </FooterBar>

  <main>
    <KeepAlive>
      <component :is="viewComponent"></component>
    </KeepAlive>
  </main>
</template>

<style scoped></style>
