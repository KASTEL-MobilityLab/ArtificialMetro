<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue"
import type { Bike, CarsharingStation, Scooter } from "@/model/vehicles"
import { BaseStore } from "@/storage/base_store"
import { BaseRepo } from "@/model/repos"
import { TimeSimulator } from "@/model/simulator"
import MapView from "./MapView.vue"
import type { SwitchBusReceiver } from "./switch_bus"


const props = defineProps<{
    bus: SwitchBusReceiver,
}>()

let stations: Ref<CarsharingStation[]> = ref([])
let scooters: Ref<Scooter[]> = ref([])
let bikes: Ref<Bike[]> = ref([])

let simulator = new TimeSimulator(3 * 60 * 60 /*3h period*/, 1 /*1s delay*/)
const timeFormat = Intl.DateTimeFormat("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })
let currentTime = computed(() => {
    const time = simulator.time.value
    return timeFormat.format(time)
})
let simulationRunning = ref(false)

onMounted(async () => {
    props.bus.onResume(() => {
        simulator.resetTimeBounds()
        simulator.startSimulation()
    })

    props.bus.onSuspend(() => {
        simulator.stopSimulation()
    })
})

simulator.onReset(() => {
    stations.value = []
    scooters.value = []
    bikes.value = []
})

simulator.onContinue(() => {
    simulationRunning.value = false
    simulator.resetTimeBounds()
    simulator.startSimulation()
})

simulator.onStart(() => {
    simulationRunning.value = true
})

simulator.onTick(async time => {
    let store = await BaseStore.open()
    let carsharingRepo = store.repo<CarsharingStation>(BaseRepo.CarsharingStations)
    let scooterRepo = store.repo<Scooter>(BaseRepo.Scooters)
    let bikeRepo = store.repo<Bike>(BaseRepo.Bikes)

    const new_stations = await carsharingRepo.forTimestamp(time)
    const new_scooters = await scooterRepo.forTimestamp(time)
    const new_bikes = await bikeRepo.forTimestamp(time)

    // only show new data if there was a change found in the DB
    if (new_stations.length > 0) {
        stations.value = new_stations
    }
    if (new_scooters.length > 0) {
        scooters.value = new_scooters
    }
    if (new_bikes.length > 0) {
        bikes.value = new_bikes
    }
})

</script>

<template>
    <MapView :scooters="scooters" :stations="stations" :bikes="bikes" :bus="bus"></MapView>
    <div class="current-time">
        <span class="live-dot" active="false"></span>
        {{ currentTime }}
    </div>
</template>

<style scoped></style>
