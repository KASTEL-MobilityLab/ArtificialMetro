<script setup lang="ts">
import { onMounted, ref } from 'vue'
import TimelapseView from './view/TimelapseView.vue'
import FooterBar from './view/FooterBar.vue'
import * as provider from './provider/provider'
import ViewSwitcher from './view/ViewSwitcher.vue';
import { GlobeIcon, MapIcon, TimerIcon } from 'lucide-vue-next';

const views = [
    { title: "Map", icon: MapIcon },
    { title: "Timelapse", icon: TimerIcon },
    { title: "Other", icon: GlobeIcon },
]
const activeView = ref(1)

onMounted(() => {
  provider.startCarsharingProvider()
  provider.startScooterProvider()
})
</script>

<template>
  <FooterBar>
    <template #left>
      <ViewSwitcher :views="views" :active="activeView"></ViewSwitcher>
    </template>
  </FooterBar>

  <main>
    <TimelapseView></TimelapseView>
  </main>

  
</template>

<style scoped></style>
