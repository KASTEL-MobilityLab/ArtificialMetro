<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import type { Vehicle } from "@/model/vehicles"
import PresetScaler from "./PresetScaler.vue"
import type { SwitchBusReceiver } from "./switch_bus"
import { TileProvider } from "./map/tile_provider"
import LocationFrame from "./map/LocationFrame.vue"
import TileRenderer from "./map/TileRenderer.vue"
import MarkerRenderer from "./map/MarkerRenderer.vue"
import type { Marker } from "./map/tiles"
import { SpriteManager } from "./map/sprite_manager"
import LegendView, { type LegendItem } from "./LegendView.vue"
import { PRESETS } from "@/model/bounds"

const props = defineProps<{
  vehicles: Vehicle[],
  bus: SwitchBusReceiver,
  brands: LegendItem[],
}>()

const vehicleMarker = computed<Marker[]>(() => {
  return props.vehicles.map(vehicle => {
    return {
      position: vehicle.position,
      sprite: vehicle.provider,
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
spriteManager.fetchSprites(props.brands.map(provider => {
  return {
    name: provider.name,
    url: provider.icon,
    size: 20,
  }
}))

const tileProvider = new TileProvider("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png")

</script>

<template>
  <div style="height: calc(100vh); width: 100%">
    <!-- Humanitarian: https://a.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png -->
    <!-- Dark: https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png -->
    <!-- Light: https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}.png -->

    <LocationFrame :center="center" :zoom="zoom" #default="data">
      <TileRenderer v-bind="data" :tiles="tileProvider"></TileRenderer>
      <MarkerRenderer v-bind="data" :marker="vehicleMarker" :sprites="spriteManager" :size="20"></MarkerRenderer>
    </LocationFrame>

  </div>
  <PresetScaler :current-preset="currentPreset" :num-presets="PRESETS.length" @click="setToPreset"></PresetScaler>
  <LegendView :entries="brands"></LegendView>
</template>

<style scoped></style>
