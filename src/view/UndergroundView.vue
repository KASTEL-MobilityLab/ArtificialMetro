<script setup lang="ts">
import LocationFrame from './map/LocationFrame.vue';
import TileRenderer from './map/TileRenderer.vue';
import MarkerRenderer from './map/MarkerRenderer.vue';
import type { SwitchBusReceiver } from './switch_bus';
import { TileProvider } from './map/tile_provider';
import { SpriteManager } from './map/sprite_manager';
import { tramStation } from '@/model/brands';
import type { Marker } from './map/tiles';
import type { TramDeparture, Coordinate } from '@/model/vehicles';
import LineRenderer from './map/LineRenderer.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { BaseStore } from '@/storage/base_store';
import { BaseRepo } from '@/model/repos';
import type { CacheRepo } from '@/storage/cache_repo';

const VELVET = "#902C3E" // Velvet Underground

defineProps<{
    bus: SwitchBusReceiver,
}>()

let tramRepo = ref<CacheRepo<TramDeparture, BaseRepo> | null>(null)

let zoom = 16
let center = { lon: 8.41, lat: 49.0054 }
const tileProvider = new TileProvider("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png")

const stations: { [key: string]: Coordinate } = {
    marktplatzKaiserstrasse: { lat: 49.009656, lon: 8.403112 },
    marktplatzPyramide: { lat: 49.009302, lon: 8.403918 },
    europaplatz: { lat: 49.010013, lon: 8.395048 },
    ettlingerTor: { lat: 49.005444, lon: 8.403502 },
    kongresszentrum: { lat: 49.002508, lon: 8.403188 },
    kronenplatz: { lat: 49.009249, lon: 8.410788 },
    durlacherTor: { lat: 49.008749, lon: 8.418109 },
}
const stationConnections = [
    { start: stations.europaplatz, end: stations.marktplatzKaiserstrasse },
    { start: stations.marktplatzKaiserstrasse, end: stations.kronenplatz },
    { start: stations.kronenplatz, end: stations.durlacherTor },
    { start: stations.kronenplatz, end: stations.marktplatzPyramide },
    { start: stations.marktplatzKaiserstrasse, end: stations.marktplatzPyramide },
    { start: stations.marktplatzPyramide, end: stations.ettlingerTor },
    { start: stations.ettlingerTor, end: stations.kongresszentrum },
]

const stationMarker = ref<Marker[]>([])
const spriteManager = new SpriteManager()
spriteManager.fetchSprite({
    name: 'station',
    size: 20,
    url: tramStation,
}).then(() => {
    stationMarker.value = Object.keys(stations).map<Marker>(key => {
        return {
            position: stations[key],
            sprite: "station",
        }
    })
})

const currentTime = ref(new Date())
function updateTime() {
    currentTime.value = new Date()
}

type Section = [TramDeparture, TramDeparture]
const sections: Section[] = []
const currentTrains = ref<Coordinate[]>([])
const currentTrainMarkers = computed<Marker[]>(() => {
    return currentTrains.value.map(t => {
        return {
            position: t,
            sprite: "station",
        }
    })
})

onMounted(async () => {
    const baseStore = await BaseStore.open()
    tramRepo.value = baseStore.repo<TramDeparture>(BaseRepo.TramDepartures)
    tramRepo.value.onUpdate(() => updateSections())
    updateSections()

    setInterval(updateTime, 2 * 1000 /*2s*/)
})


async function updateSections() {
    if (tramRepo.value == null) return
    const departures = await tramRepo.value.current()
    const startDepartures = departures.filter(d => d.station == "7001001")
    const endDepartures = departures.filter(d => d.station == "7001002")

    sections.splice(0, sections.length, ...startDepartures
        .map(d => matchDeparture(d, endDepartures))
        .filter(d => d != null)
        .map(d => d as Section)
    )
}

function matchDeparture(departure: TramDeparture, otherDepartures: TramDeparture[]): Section | null {
    for (const otherDeparture of otherDepartures) {
        if (otherDeparture.trainNumber == departure.trainNumber) {
            return [departure, otherDeparture]
        }
    }
    return null
}

watch(() => currentTime.value, time => {
    const activeTrains = sections.filter(s => {
        const departureInPast = new Date(s[0].realtime) < time
        const arrivalInFuture = new Date(s[1].realtime) > time
        return departureInPast && arrivalInFuture
    })
    currentTrains.value = activeTrains.map(train => {
        const startTime = new Date(train[0].realtime)
        const endTime = new Date(train[1].realtime)
        const timeDifference = endTime.getTime() - startTime.getTime()
        const factor = (currentTime.value.getTime() - startTime.getTime()) / timeDifference
        const currentPosition = { 
            lat: stations.durlacherTor.lat - (stations.durlacherTor.lat - stations.kronenplatz.lat) * factor, 
            lon: stations.durlacherTor.lon - (stations.durlacherTor.lon - stations.kronenplatz.lon) * factor, 
        }
        return currentPosition
    })
    console.log(activeTrains, currentTrains.value)
})



</script>

<template>
    <div style="height: calc(100vh); width: 100%">

        <LocationFrame :center="center" :zoom="zoom" #default="data">
            <TileRenderer v-bind="data" :tiles="tileProvider"></TileRenderer>
            <LineRenderer v-bind="data" :lines="stationConnections" :color="VELVET"></LineRenderer>
            <!-- <MarkerRenderer v-bind="data" :marker="stationMarker" :sprites="spriteManager" :size="20"></MarkerRenderer> -->
            <MarkerRenderer v-bind="data" :marker="currentTrainMarkers" :sprites="spriteManager" :size="20">
            </MarkerRenderer>
        </LocationFrame>

    </div>
</template>

<style scoped></style>