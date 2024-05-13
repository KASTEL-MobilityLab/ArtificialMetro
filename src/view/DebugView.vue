<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet"
import { computed, onMounted, ref, type Ref } from "vue"
import type { CarsharingStation, Scooter } from "@/model/vehicles"
import * as carsharing from '../provider/carsharing'
import * as scooter from '../provider/scooter'
import { BaseStore, BaseRepo } from "@/storage/base_store"

// This is needed to correctly load leaflet
// see https://github.com/vue-leaflet/vue-leaflet/issues/278
globalThis.L = L

let zoom = ref(14)
let stations: Ref<CarsharingStation[]> = ref([])
let scooters: Ref<Scooter[]> = ref([])

let attribution = computed(() => {
  return `Carsharing: ${carsharing.attribution}, Scooter: ${scooter.attribution}`
})

onMounted(async () => {
  let store = await BaseStore.open()
  store.onUpdate(BaseRepo.CarsharingStations, async () => {
    let repo = store.carsharingStations()
    let new_stations = await repo.get()
    stations.value.splice(0, stations.value.length, ...new_stations)
  })
  store.onUpdate(BaseRepo.Scooters, async () => {
    let repo = store.scooters()
    const new_scooters = await repo.get()
    scooters.value.splice(0, scooters.value.length, ...new_scooters)
  })
})

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

      <LCircleMarker v-for="marker, i in scooters" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"
        :fill="true" fill-color="blue" :fill-opacity="1" :stroke="false" :radius="5"></LCircleMarker>
    </LMap>
  </div>
  <Teleport to="#view-controls">
    <span>{{ attribution }}</span>
  </Teleport>
</template>

<style scoped></style>
