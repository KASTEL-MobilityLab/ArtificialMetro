<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { LMap, LTileLayer, LMarker } from "@vue-leaflet/vue-leaflet"
import { ref, type Ref } from "vue"
import type { CarsharingStation, Coordinate } from "@/model/vehicles"

// This is needed to correctly load leaflet
// see https://github.com/vue-leaflet/vue-leaflet/issues/278
globalThis.L = L

let zoom = ref(14)
let stations: Ref<[CarsharingStation]> = ref([] as unknown as [CarsharingStation])

let channel = new BroadcastChannel("carsharing")
channel.onmessage = (message: MessageEvent<CarsharingStation>) => {
  const station = message.data
  if (station.available > 0) {
    stations.value.push(station)
  }
}

</script>

<template>
  <div style="height: calc(100vh - 100px); width: 100%">
    <LMap v-model:zoom="zoom" :center="[49.006889, 8.403653]">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OSM"></LTileLayer>
      <LMarker v-for="marker, i in stations" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"></LMarker>
    </LMap>
  </div>
</template>

<style scoped>

</style>
