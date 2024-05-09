<script setup lang="ts">
import { onMounted } from 'vue'
import DebugView from './view/DebugView.vue'
import FooterBar from './view/FooterBar.vue'
import * as carsharing from './provider/carsharing'

onMounted(() => {
  carsharing.load()
})
</script>

<template>
  <main>
    <DebugView></DebugView>
  </main>

  <FooterBar></FooterBar>
</template>

<style scoped></style>
