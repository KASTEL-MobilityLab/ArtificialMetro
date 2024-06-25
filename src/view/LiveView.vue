<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue"
import type { Bike, CarsharingStation, Scooter } from "@/model/vehicles"
import * as carsharing from '../provider/carsharing'
import * as scooter from '../provider/scooter'
import { BaseStore } from "@/storage/base_store"
import { BaseRepo } from "@/model/repos"
import MapView from "./MapView.vue"
import { SwitchBusReceiver } from "./switch_bus"
import type { CacheRepo } from "@/storage/cache_repo"

defineProps<{
  bus: SwitchBusReceiver,
}>()

let currentTimestamp = ref(new Date())
let stations: Ref<CarsharingStation[]> = ref([])
let scooters: Ref<Scooter[]> = ref([])
let bikes: Ref<Bike[]> = ref([])

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
  let bikeRepo = store.repo<Bike>(BaseRepo.Bikes)

  carsharingRepo.onUpdate(updateCarsharing)
  scooterRepo.onUpdate(updateScooters)
  bikeRepo.onUpdate(updateBikes)

  updateCarsharing(carsharingRepo)
  updateScooters(scooterRepo)
  updateBikes(bikeRepo)
})

async function updateScooters(repo: CacheRepo<Scooter, BaseRepo>) {
  const new_scooters = await repo.current()
  scooters.value = new_scooters
  updateTimestamp(repo)
}

async function updateCarsharing(repo: CacheRepo<CarsharingStation, BaseRepo>) {
  let new_stations = await repo.current()
  stations.value = new_stations
  updateTimestamp(repo)
}

async function updateBikes(repo: CacheRepo<Bike, BaseRepo>) {
  let new_bikes = await repo.current()
  bikes.value = new_bikes
  updateTimestamp(repo)
}

async function updateTimestamp(repo: CacheRepo<any,any>) {
  let timestamp = await repo.getLatestTimestamp()
  if (timestamp != null) currentTimestamp.value = timestamp
}
</script>

<template>
  <MapView :scooters="scooters" :stations="stations" :bikes="bikes" :attribution="attribution" :bus="bus"></MapView>
  <div class="current-time"><span class="live-dot"></span> {{ currentTime }}</div>
</template>

<style scoped></style>
