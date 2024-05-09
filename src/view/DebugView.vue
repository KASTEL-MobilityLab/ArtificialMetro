<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet"
import { ref, type Ref } from "vue";

// This is needed to correctly load leaflet
// see https://github.com/vue-leaflet/vue-leaflet/issues/278
globalThis.L = L;

type Coordinate = [number, number];

let zoom = ref(14);
let markers: Ref<[Coordinate]> = ref([] as unknown as [Coordinate]);

let channel = new BroadcastChannel("carsharing");
channel.onmessage = (car: MessageEvent<Coordinate>) => {
  markers.value.push(car.data)
}

</script>

<template>
  <div style="height: calc(100vh - 100px); width: 100%">
    <LMap v-model:zoom="zoom" :center="[49.006889, 8.403653]">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OSM"></LTileLayer>
      <LMarker v-for="marker, i in markers" v-bind:key="i" :lat-lng="marker"></LMarker>
    </LMap>
  </div>
</template>

<style scoped>

</style>
