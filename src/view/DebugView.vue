<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet"
import { ref } from "vue";

// This is needed to correctly load leaflet
// see https://github.com/vue-leaflet/vue-leaflet/issues/278
globalThis.L = L;

let zoom = ref(14);

</script>

<template>
  <div style="height: 600px; width: 800px">
    <LMap v-model:zoom="zoom" :center="[49.006889, 8.403653]">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OSM"></LTileLayer>
      <LMarker :lat-lng="[49.006889, 8.403653]"></LMarker>
    </LMap>
  </div>
</template>

<style scoped>

</style>
