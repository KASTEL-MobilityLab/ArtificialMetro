<script setup lang="ts">
import { computed, onMounted, ref, watch, type Ref } from "vue"
import type { CarsharingStation, Scooter } from "@/model/vehicles"
import * as carsharing from '../provider/carsharing'
import * as scooter from '../provider/scooter'
import { BaseStore, BaseRepo } from "@/storage/base_store"
import MapView from "./MapView.vue"
import { SwitchBusReceiver } from "./switch_bus"
import type { Repo } from "@/storage/repo"

defineProps<{
  bus: SwitchBusReceiver,
}>()

let currentTimestamp = ref(new Date())
let stations: Ref<CarsharingStation[]> = ref([])
let scooters: Ref<Scooter[]> = ref([])

const timeFormat = Intl.DateTimeFormat("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })

let currentTime = computed(() => {
    return timeFormat.format(currentTimestamp.value)
})

let attribution = computed(() => {
  return `Carsharing: ${carsharing.attribution}, Scooter: ${scooter.attribution}`
})

onMounted(async () => {
  let store = await BaseStore.open()
  let carsharingRepo = store.repo<CarsharingStation>(BaseRepo.CarsharingStations)
  let scooterRepo = store.repo<Scooter>(BaseRepo.Scooters)

  carsharingRepo.onUpdate(updateCarsharing)
  scooterRepo.onUpdate(updateScooters)

  updateCarsharing(carsharingRepo)
  updateScooters(scooterRepo)
})

async function updateScooters(repo: Repo<Scooter, BaseRepo>) {
  const new_scooters = await repo.current()
  scooters.value = new_scooters
  updateTimestamp(repo)
}

async function updateCarsharing(repo: Repo<CarsharingStation, BaseRepo>) {
  let new_stations = await repo.current()
  stations.value = new_stations
  updateTimestamp(repo)
}

async function updateTimestamp(repo: Repo<any,any>) {
  let timestamp = await repo.getLatestTimestamp()
  if (timestamp != null) currentTimestamp.value = timestamp
}
</script>

<template>
  <MapView :scooters="scooters" :stations="stations" :attribution="attribution" :bus="bus"></MapView>
  <div class="current-time"><span class="live-dot"></span> {{ currentTime }}</div>
</template>

<style scoped></style>
