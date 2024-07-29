<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from "vue"
import type { Bike, CarsharingStation, Scooter, Vehicle } from "@/model/vehicles"
import { BaseStore } from "@/storage/base_store"
import { BaseRepo } from "@/model/repos"
import { TimeSimulator } from "@/model/simulator"
import MapView from "./MapView.vue"
import type { SwitchBusReceiver } from "./switch_bus"
import { brands } from "@/model/brands"
import type { CacheRepo } from "@/storage/cache_repo"


const props = defineProps<{
    bus: SwitchBusReceiver,
}>()

let vehicles: Ref<Vehicle[]> = ref([])

let simulator = new TimeSimulator(3 * 60 * 60 /*3h period*/, 1 /*1s delay*/)
const timeFormat = Intl.DateTimeFormat("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })
let currentTime = computed(() => {
    const time = simulator.time.value
    return timeFormat.format(time)
})
let simulationRunning = ref(false)

let repos: CacheRepo<Vehicle, BaseRepo>[] = []

onMounted(async () => {
    let store = await BaseStore.open()
    repos.push(store.repo(BaseRepo.CarsharingStations))
    repos.push(store.repo(BaseRepo.Scooters))
    repos.push(store.repo(BaseRepo.Bikes))

    props.bus.onResume(() => {
        simulator.resetTimeBounds()
        simulator.startSimulation()
    })

    props.bus.onSuspend(() => {
        simulator.stopSimulation()
    })
})

simulator.onReset(() => {
    vehicles.value = []
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
    vehicles.value = []
    for (const repo of repos) {
        const newVehicles = await repo.forTimestamp(time)
        vehicles.value.push(...newVehicles)
    }
})

</script>

<template>
    <MapView :bus="bus" :brands="brands" :vehicles="vehicles"></MapView>
    <div class="current-time">
        <span class="live-dot" active="false"></span>
        {{ currentTime }}
    </div>
</template>

<style scoped></style>
