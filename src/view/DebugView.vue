<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue"
import type { CarsharingStation, Scooter } from "@/model/vehicles"
import * as carsharing from '../provider/carsharing'
import * as scooter from '../provider/scooter'
import { BaseStore, BaseRepo } from "@/storage/base_store"
import MapView from "./MapView.vue"

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
    repo.getMaxTimestamp()
    scooters.value.splice(0, scooters.value.length, ...new_scooters)
  })
})

</script>

<template>
  <MapView :scooters="scooters" :stations="stations" :attribution="attribution"></MapView>
</template>

<style scoped></style>
