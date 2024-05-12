<script setup lang="ts">
import { onMounted } from 'vue'
import DebugView from './view/DebugView.vue'
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
    <DebugView></DebugView>
  </main>

  
</template>

<style scoped></style>
