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

let repos: CacheRepo<Vehicle, BaseRepo>[] = []
let vehicleLists: { [key: string]: Ref<Vehicle[]> } = {}
Object.keys(BaseRepo).forEach(b => vehicleLists[b] = ref([]))
let allVehicles = computed<Vehicle[]>(() => join(vehicleLists))

const emptyRepos: Ref<BaseRepo[]> = ref([])
const timeFormat = Intl.DateTimeFormat("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })

let currentTimestamp = ref(new Date())
let currentTime = computed(() => {
  return timeFormat.format(currentTimestamp.value)
})

onMounted(async () => {
  let store = await BaseStore.open()
  repos.push(store.repo(BaseRepo.CarsharingStations))
  repos.push(store.repo(BaseRepo.Scooters))
  repos.push(store.repo(BaseRepo.Bikes))

  for (const _repo in repos) {
    repos[_repo].onUpdate(updateVehicles)
    updateVehicles(repos[_repo])
  }

  checkDataAvailability()
})

function checkDataAvailability() {
  emptyRepos.value = []
  repos.forEach(async repo => {
    if (await repo.isEmpty()) {
      emptyRepos.value.push(repo.kind())
    }
  })
}

async function updateVehicles(repo: CacheRepo<Vehicle, BaseRepo>) {
  const newVehicles = await repo.current()
  vehicleLists[repo.kind()].value = newVehicles
  updateTimestamp(repo)
  checkDataAvailability()
}

async function updateTimestamp(repo: CacheRepo<any, any>) {
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

function join<T>(list: { [key: string]: Ref<T[]> }): T[] {
  const all: T[] = []
  for (const item in list) {
    all.push(...list[item].value)
  }
  return all
}

</script>

<template>
  <MapView :bus="bus" :brands="relevantBrands" :vehicles="allVehicles"></MapView>
  <div class="current-time"><span class="live-dot"></span> {{ currentTime }}</div>
</template>

<style scoped></style>
