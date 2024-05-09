<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { LMap, LTileLayer, LMarker, LCircleMarker } from "@vue-leaflet/vue-leaflet"
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

function num_to_color(num: number): string {
  if (num == 1) {
    return "red"
  } else if (num == 2) {
    return "yellow"
  } else {
    return "green"
  }
}

</script>

<template>
  <div style="height: calc(100vh - 100px); width: 100%">
    <LMap v-model:zoom="zoom" :center="[49.006889, 8.403653]">
      <LTileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base" name="OSM"></LTileLayer>
      <!-- <LMarker v-for="marker, i in stations" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"></LMarker> -->
      <LCircleMarker v-for="marker, i in stations" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"
        :fill="true" :fill-color="num_to_color(marker.available)" :fill-opacity="1" :stroke="true" :radius="8"
        color="black"></LCircleMarker>
    </LMap>
  </div>
</template>

<style scoped></style>
