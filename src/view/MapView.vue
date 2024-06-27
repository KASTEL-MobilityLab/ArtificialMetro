<script setup lang="ts">
import "leaflet/dist/leaflet.css"
import { computed, onMounted, ref, watch } from "vue"
import type { Bike, CarsharingStation, Scooter } from "@/model/vehicles"
import PresetScaler from "./PresetScaler.vue"
import type { SwitchBusReceiver } from "./switch_bus"
import { TileProvider } from "./map/tile_provider"
import LocationFrame from "./map/LocationFrame.vue"
import TileRenderer from "./map/TileRenderer.vue"
import MarkerRenderer from "./map/MarkerRenderer.vue"
import type { Marker } from "./map/tiles"
import { SpriteManager } from "./map/sprite_manager"

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

const bikeMarker = computed<Marker[]>(() => {
  return props.bikes.map(bike => {
    return {
      position: bike.position,
      sprite: bike.provider,
    }
  })
})

const scooterMarker = computed<Marker[]>(() => {
  return props.scooters.map(scooter => {
    return {
      position: scooter.position,
      sprite: scooter.provider,
    }
  })
})

const stationMarker = computed<Marker[]>(() => {
  return props.stations.map(station => {
    return {
      position: station.position,
      sprite: station.provider,
    }
  })
})

let currentPreset = ref(1)
let zoom = computed(() => PRESETS[currentPreset.value].zoom)
let center = computed(() => PRESETS[currentPreset.value].position)

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

const spriteManager = new SpriteManager()
spriteManager.fetchSprites([
  {name: "nextbike", url: "/brands/nextbike.svg", size: 20},
  {name: "nextbike2", url: "/brands/nextbike.svg", size: 20},
  {name: "stadtmobil_karlsruhe", url: "/brands/stadtmobil_karlsruhe.svg", size: 20},
  {name: "voi_karlsruhe", url: "/brands/scooter_voi.svg", size: 20},
  {name: "bolt_karlsruhe", url: "/brands/scooter_bolt.svg", size: 20},
])

const tileProvider = new TileProvider("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png")

</script>

<template>
  <div style="height: calc(100vh); width: 100%">
    <!-- Humanitarian: https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png -->
    <!-- Dark: https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png -->
    <!-- Light: https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png -->

    <LocationFrame :center="center" :zoom="zoom" #default="data">
      <TileRenderer v-bind="data" :tiles="tileProvider"></TileRenderer>
      <MarkerRenderer v-bind="data" :marker="stationMarker" :sprites="spriteManager"></MarkerRenderer>
      <MarkerRenderer v-bind="data" :marker="scooterMarker" :sprites="spriteManager"></MarkerRenderer>
      <MarkerRenderer v-bind="data" :marker="bikeMarker" :sprites="spriteManager"></MarkerRenderer>
    </LocationFrame>

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
