<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue"
import type { CarsharingStation, Scooter } from "@/model/vehicles"
import * as carsharing from '../provider/carsharing'
import * as scooter from '../provider/scooter'
import { BaseStore, BaseRepo } from "@/storage/base_store"
import { TimeSimulator } from "@/model/simulator"
import MapView from "./MapView.vue"
import type { SwitchBusReceiver } from "./switch_bus"


defineProps<{
  bus: SwitchBusReceiver,
}>()

let stations: Ref<CarsharingStation[]> = ref([])
let scooters: Ref<Scooter[]> = ref([])

let simulator = new TimeSimulator(2 /*s*/)

let attribution = computed(() => {
  return `Carsharing: ${carsharing.attribution}, Scooter: ${scooter.attribution}`
})

onMounted(async () => {
  simulator.resetTimeBounds()
  simulator.startSimulation()
})

simulator.onReset(() => {
    stations.value.splice(0, stations.value.length)
    scooters.value.splice(0, scooters.value.length)
})

simulator.onStop(() => {
    simulator.resetTimeBounds()
    simulator.startSimulation()
})

simulator.onTick(async time => {
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
    <MapView :scooters="scooters" :stations="stations" :attribution="attribution" :bus="bus"></MapView>
</template>

<style scoped></style>
