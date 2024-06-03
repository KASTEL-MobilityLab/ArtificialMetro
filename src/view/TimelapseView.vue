<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet"
import { computed, onMounted, ref, watch, type Ref } from "vue"
import type { CarsharingStation, Scooter } from "@/model/vehicles"
import * as carsharing from '../provider/carsharing'
import * as scooter from '../provider/scooter'
import { BaseStore, BaseRepo } from "@/storage/base_store"
import PresetScaler from "./PresetScaler.vue"
import { TimeSimulator } from "@/model/simulator"

// This is needed to correctly load leaflet
// see https://github.com/vue-leaflet/vue-leaflet/issues/278
globalThis.L = L

const PRESETS = [
  {
    position: {
      lat: 49.006889,
      lon: 8.403653,
    },
    zoom: 14,
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
let center = computed(() => PRESETS[currentPreset.value].position)
let stations: Ref<CarsharingStation[]> = ref([])
let scooters: Ref<Scooter[]> = ref([])

let simulator = new TimeSimulator()

let attribution = computed(() => {
  return `Carsharing: ${carsharing.attribution}, Scooter: ${scooter.attribution}`
})

onMounted(async () => {
  let store = await BaseStore.open()
  let carsharingRepo = store.repo<CarsharingStation>(BaseRepo.CarsharingStations)
  let scooterRepo = store.repo<Scooter>(BaseRepo.Scooters)

  simulator.resetTimeBounds()
  simulator.startSimulation()
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

function setToPreset(num: number) {
  currentPreset.value = num - 1
}


simulator.onReset(() => {
    stations.value.splice(0, stations.value.length)
    scooters.value.splice(0, scooters.value.length)
})

simulator.onTick(async time => {
    if (time == null) return
    console.log('time:', time)
    let store = await BaseStore.open()
    let carsharingRepo = store.repo<CarsharingStation>(BaseRepo.CarsharingStations)
    let scooterRepo = store.repo<Scooter>(BaseRepo.Scooters)

    const new_stations = await carsharingRepo.forTimestamp(time)
    const new_scooter = await scooterRepo.forTimestamp(time)

    if (new_stations.length > 0) {
        // only show new stations if there was a chnage found in the DB
        stations.value.splice(0, stations.value.length, ...new_stations)
    }
    if (new_scooter.length > 0) {
        // only show new stations if there was a chnage found in the DB
        scooters.value.splice(0, scooters.value.length, ...new_scooter)
    }
})

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
  <PresetScaler :current-preset="currentPreset" :num-presets="PRESETS.length" @click="setToPreset"></PresetScaler>
  <Teleport to="#view-controls">
    <span>Timelapse  {{ attribution }}</span>
  </Teleport>
</template>

<style scoped></style>
