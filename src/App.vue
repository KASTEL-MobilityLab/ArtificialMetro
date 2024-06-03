<script setup lang="ts">
import { onMounted } from 'vue'
import TimelapseView from './view/TimelapseView.vue'
import FooterBar from './view/FooterBar.vue'
import * as provider from './provider/provider'

onMounted(() => {
  provider.startCarsharingProvider()
  provider.startScooterProvider()
})
</script>

<template>
  <FooterBar></FooterBar>

  <main>
    <TimelapseView></TimelapseView>
  </main>

  
</template>

<style scoped></style>
