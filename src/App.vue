<script setup lang="ts">
import { onMounted } from 'vue';
import DebugView from './view/DebugView.vue';
import * as carsharing from './provider/carsharing';

onMounted(() => {
  carsharing.load()
})
</script>

<template>
  <header>

  </header>

  <main>
    <DebugView></DebugView>
  </main>
</template>

<style scoped></style>
