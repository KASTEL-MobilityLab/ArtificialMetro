<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import { LMap, LTileLayer, LCircleMarker } from "@vue-leaflet/vue-leaflet"
import { computed, onMounted, ref, watch } from "vue"
import type { Bike, CarsharingStation, Scooter } from "@/model/vehicles"
import PresetScaler from "./PresetScaler.vue"
import type { SwitchBusReceiver } from "./switch_bus"

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

const props = defineProps<{
  stations: CarsharingStation[],
  scooters: Scooter[],
  bikes: Bike[],
  attribution: string,
  bus: SwitchBusReceiver,
}>()

let currentPreset = ref(1)
let zoom = computed(() => PRESETS[currentPreset.value].zoom)
let center = computed(() => PRESETS[currentPreset.value].position)

let colors: { [key: string]: string } = {
  "nextbike": "#C30937",
  "nextbike2": "blue",
  "stadtmobil_karlsruhe": "#FF7C1E",
  "bolt_karlsruhe": "#32BB78",
  "voi_karlsruhe": "#F26961",
}

function providerColor(provider: string): string {
  if (provider in colors) {
    return colors[provider]
  }
  console.log(provider)
  return "black"
}

function setToPreset(num: number) {
  currentPreset.value = num - 1
}

function nextPreset() {
  const next = (currentPreset.value + 1) % PRESETS.length
  currentPreset.value = next
}

onMounted(() => {
  props.bus.onNextPreset(nextPreset)
})

watch(() => props.bus, (bus) => {
  bus.onNextPreset(nextPreset)
})

</script>

<template>
  <div style="height: calc(100vh); width: 100%">
    <LMap :zoom="zoom" :center="[center.lat, center.lon]">
      <!-- Humanitarian: https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png -->
      <!-- Dark: https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png -->
      <!-- Light: https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png -->

      <LTileLayer url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png" layer-type="base"
        name="OSM"></LTileLayer>
      <!-- <LTileLayer url="https://c.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png" layer-type="overlay" name="OSM"></LTileLayer> -->
      <LCircleMarker v-for="marker, i in stations" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"
        :fill="true" :fill-color="providerColor(marker.provider)" :fill-opacity="1" :stroke="false" :radius="8"
        color="black"></LCircleMarker>

      <LCircleMarker v-for="marker, i in scooters" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"
        :fill="true" :fill-color="providerColor(marker.provider)" :fill-opacity="1" :stroke="false" :radius="5">
      </LCircleMarker>
      <LCircleMarker v-for="marker, i in bikes" v-bind:key="i" :lat-lng="[marker.position.lat, marker.position.lon]"
        :fill="true" :fill-color="providerColor(marker.provider)" :fill-opacity="1" :stroke="false" :radius="(marker.provider == 'nextbike2') ? 2 : 5">
      </LCircleMarker>
    </LMap>
  </div>
  <PresetScaler :current-preset="currentPreset" :num-presets="PRESETS.length" @click="setToPreset"></PresetScaler>
  <div class="attribution">
    {{ attribution }}
  </div>
</template>

<style scoped>
.attribution {
  position: absolute;
  z-index: 1000;

  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;

  bottom: 5px;
  right: 5px;
  padding: 5px 10px;
  border-radius: 5px;
  max-width: 50%;

  background: var(--card-bg-color);
  color: var(--card-fg-color);
  box-shadow: 0 0 5px var(--card-shade-color);
}
</style>
