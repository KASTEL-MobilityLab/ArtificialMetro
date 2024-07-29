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

let allVehicles = computed<Vehicle[]>(() => {
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

  carsharingRepo.onUpdate(updateVehicles)
  scooterRepo.onUpdate(updateVehicles)
  bikeRepo.onUpdate(updateVehicles)

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

  updateVehicles(carsharingRepo)
  updateVehicles(scooterRepo)
  updateVehicles(bikeRepo)
})

async function updateVehicles(repo: CacheRepo<Vehicle, BaseRepo>) {
  const newVehicles = await repo.current()
  vehicleLists[repo.kind()].value = newVehicles
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
  <MapView :bus="bus" :brands="relevantBrands" :vehicles="allVehicles"></MapView>
  <div class="current-time"><span class="live-dot"></span> {{ currentTime }}</div>
</template>

<style scoped></style>
