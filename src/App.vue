<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import TimelapseView from './view/TimelapseView.vue'
import FooterBar from './view/FooterBar.vue'
import * as provider from './provider/provider'
import ViewSwitcher from './view/ViewSwitcher.vue';
import { MapIcon, TimerIcon } from 'lucide-vue-next';
import DebugView from './view/DebugView.vue';

const views = [
    { title: "Map", icon: MapIcon, component: DebugView },
    { title: "Timelapse", icon: TimerIcon, component: TimelapseView },
]
const activeView = ref(0)
const viewComponent = computed(() => views[activeView.value].component)

onMounted(() => {
  provider.startCarsharingProvider()
  provider.startScooterProvider()
})
</script>

<template>
  <FooterBar>
    <template #left>
      <ViewSwitcher 
        :views="views" 
        :active="activeView" 
        @switch="view => activeView = view"
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
