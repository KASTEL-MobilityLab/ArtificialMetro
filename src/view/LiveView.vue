<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue"
import { type Vehicle, type Bike, type CarsharingStation, type Scooter } from "@/model/vehicles"
import { BaseStore } from "@/storage/base_store"
import { BaseRepo } from "@/model/repos"
import MapView from "./MapView.vue"
import { SwitchBusReceiver } from "./switch_bus"
import type { CacheRepo } from "@/storage/cache_repo"
import { brands } from "@/model/brands"

defineProps<{
  bus: SwitchBusReceiver,
}>()

let currentTimestamp = ref(new Date())

let vehicleLists: {[key: string]: Ref<Vehicle[]>} = {}
Object.keys(BaseRepo).forEach(b => vehicleLists[b] = ref([]))

let vehicles = computed<Vehicle[]>(() => {
  const vehicles = []
  for (const repo in vehicleLists) {
    vehicles.push(...vehicleLists[repo].value)
  }
  return vehicles
})

const emptyRepos: Ref<BaseRepo[]> = ref([])
const timeFormat = Intl.DateTimeFormat("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })

let currentTime = computed(() => {
    return timeFormat.format(currentTimestamp.value)
})
onMounted(async () => {
  let store = await BaseStore.open()
  let carsharingRepo = store.repo<CarsharingStation>(BaseRepo.CarsharingStations)
  let scooterRepo = store.repo<Scooter>(BaseRepo.Scooters)
  let bikeRepo = store.repo<Bike>(BaseRepo.Bikes)

  carsharingRepo.onUpdate(updateCarsharing)
  scooterRepo.onUpdate(updateScooters)
  bikeRepo.onUpdate(updateBikes)

  if (await carsharingRepo.isEmpty()) {
    emptyRepos.value.push(BaseRepo.CarsharingStations)
  }
  if (await scooterRepo.isEmpty()) {
    console.log('no scooter')
    emptyRepos.value.push(BaseRepo.Scooters)
  }
  if (await bikeRepo.isEmpty()) {
    emptyRepos.value.push(BaseRepo.Bikes)
  }

  updateCarsharing(carsharingRepo)
  updateScooters(scooterRepo)
  updateBikes(bikeRepo)
})

async function updateScooters(repo: CacheRepo<Scooter, BaseRepo>) {
  const new_scooters = await repo.current()
  vehicleLists[BaseRepo.Scooters].value = new_scooters
  updateTimestamp(repo)
}

async function updateCarsharing(repo: CacheRepo<CarsharingStation, BaseRepo>) {
  let new_stations = await repo.current()
  vehicleLists[BaseRepo.CarsharingStations].value = new_stations
  updateTimestamp(repo)
}

async function updateBikes(repo: CacheRepo<Bike, BaseRepo>) {
  let new_bikes = await repo.current()
  vehicleLists[BaseRepo.Bikes].value = new_bikes
  updateTimestamp(repo)
}

async function updateTimestamp(repo: CacheRepo<any,any>) {
  let timestamp = await repo.getLatestTimestamp()
  if (timestamp != null) currentTimestamp.value = timestamp
}

const relevantBrands = computed(() => {
  const skipRepos = emptyRepos.value
  return brands.filter(b => !contains(b.repo, skipRepos))
})

function contains<T>(value: T, list: T[]): boolean {
  for (const item of list) {
    if (item == value) {
      return true
    }
  }
  return false
}

</script>

<template>
  <MapView :bus="bus" :brands="relevantBrands" :vehicles="vehicles"></MapView>
  <div class="current-time"><span class="live-dot"></span> {{ currentTime }}</div>
</template>

<style scoped></style>
