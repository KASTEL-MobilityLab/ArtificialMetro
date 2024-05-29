<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet"
import { computed, onMounted, ref, type Ref } from "vue"
import type { CarsharingStation, Scooter } from "@/model/vehicles"
import * as carsharing from '../provider/carsharing'
import * as scooter from '../provider/scooter'
import { BaseStore, BaseRepo } from "@/storage/base_store"
import PresetScaler from "./PresetScaler.vue"

// This is needed to correctly load leaflet
// see https://github.com/vue-leaflet/vue-leaflet/issues/278
globalThis.L = L

const PRESETS = [
  {
    position: {
      lat: 49.006889,
      lon: 8.403653,
    },
    zoom: 15,
  },
  {
    position: {
      lat: 49.011620,
      lon: 8.417007,
    },
    zoom: 16,
  },
  {
    position: {
      lat: 49.013618,
      lon: 8.419233,
    },
    zoom: 17,
  }
]

let currentPreset = ref(1)
let zoom = computed(() => PRESETS[currentPreset.value].zoom)
let center = computed(() => PRESETS[0].position)
let stations: Ref<CarsharingStation[]> = ref([])
let scooters: Ref<Scooter[]> = ref([])

let attribution = computed(() => {
  return `Carsharing: ${carsharing.attribution}, Scooter: ${scooter.attribution}`
})

onMounted(async () => {
  let store = await BaseStore.open()
  let carsharingRepo = store.repo<CarsharingStation>(BaseRepo.CarsharingStations)
  let scooterRepo = store.repo<Scooter>(BaseRepo.Scooters)

  carsharingRepo.onUpdate(async repo => {
    let new_stations = await repo.current()
    stations.value.splice(0, stations.value.length, ...new_stations)
  })

  scooterRepo.onUpdate(async repo => {
    const new_scooters = await repo.current()
    repo.getMaxDate()
    scooters.value.splice(0, scooters.value.length, ...new_scooters)
  })
})

function num_to_color(num: number): string {
  if (num <= 1) {
    return "#8C423C"
  } else if (num == 2) {
    return "#A5784F"
  } else {
    return "#6F8750"
  }
}

</script>

<template>
  <div style="height: calc(100vh - 100px); width: 100%">
    <LMap v-model:zoom="zoom" :center="center">
      <!-- Humanitarian: https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png -->
      <!-- Dark: https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png -->
      <!-- Light: https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png -->
      
      <LTileLayer url="https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" layer-type="base" name="OSM"></LTileLayer>
      <!-- <LTileLayer url="https://c.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png" layer-type="overlay" name="OSM"></LTileLayer> -->
      <LCircleMarker v-for="marker, i in stations" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"
        :fill="true" :fill-color="num_to_color(marker.available)" :fill-opacity="1" :stroke="false" :radius="8"
        color="black"></LCircleMarker>

      <LCircleMarker v-for="marker, i in scooters" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"
        :fill="true" fill-color="#398888" :fill-opacity="1" :stroke="false" :radius="5"></LCircleMarker>
    </LMap>
  </div>
  <PresetScaler :current-preset="currentPreset" :num-presets="PRESETS.length"></PresetScaler>
  <Teleport to="#view-controls">
    <span>{{ attribution }}</span>
  </Teleport>
</template>

<style scoped></style>
