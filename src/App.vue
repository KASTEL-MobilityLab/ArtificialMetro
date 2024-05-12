<script setup lang="ts">
import { onMounted } from 'vue'
import DebugView from './view/DebugView.vue'
import FooterBar from './view/FooterBar.vue'
import * as carsharing from './provider/carsharing'
import * as scooter from './provider/scooter'

onMounted(() => {
  carsharing.load()
  scooter.load()
})
</script>

<template>
  <FooterBar></FooterBar>
  
  <main>
    <DebugView></DebugView>
  </main>

  
</template>

<style scoped></style>
