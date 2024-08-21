<script setup lang="ts">
import LocationFrame from './map/LocationFrame.vue';
import TileRenderer from './map/TileRenderer.vue';
import MarkerRenderer from './map/MarkerRenderer.vue';
import type { SwitchBusReceiver } from './switch_bus';
import { TileProvider } from './map/tile_provider';
import { SpriteManager } from './map/sprite_manager';
import { tramLineSprite, tramLines, tramStation } from '@/model/brands';
import type { Marker } from './map/tiles';
import type { TramDeparture, Coordinate } from '@/model/vehicles';
import LineRenderer, { type Line } from './map/LineRenderer.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { BaseStore } from '@/storage/base_store';
import { BaseRepo } from '@/model/repos';
import type { CacheRepo } from '@/storage/cache_repo';
import { easeInOutQuad, interpolateCoordinates } from './map/Coordinate';
import { Station, stationConnections, stationGeopositions } from '@/model/stations';

const VELVET = "#902C3E" // Velvet Underground

type Journey = [TramDeparture, TramDeparture]
type Train = { position: Coordinate, line: string }

const props = defineProps<{
    bus: SwitchBusReceiver,
}>()

let tramRepo = ref<CacheRepo<TramDeparture, BaseRepo> | null>(null)

let zoom = 16
let center = { lon: 8.41, lat: 49.0054 }
const tileProvider = new TileProvider("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png")

const spriteManager = new SpriteManager()
spriteManager.fetchSprite({
    name: 'station',
    size: 20,
    url: tramStation,
})
Object.keys(tramLines).forEach(line => {
    const sprite = tramLineSprite(line, 20)
    if (sprite) {
        spriteManager.registerSprite({ name: line, size: 20 }, sprite)
    }
})

// Tracks are between two stations in both directions
const tracks = [stationConnections, stationConnections.map(c => [c[1], c[0]])].flat() as [Station, Station][]
const stationMarker: Marker[] = Object.values(Station).map(s => {
    return {
        position: stationGeopositions[s],
        sprite: "station",
    }
})
const stationLines: Line[] = stationConnections.map(connection => {
    return [stationGeopositions[connection[0]], stationGeopositions[connection[1]]] as Line
})

let timer: NodeJS.Timeout | undefined =  undefined
const currentTime = ref(new Date())
function updateTime() {
    currentTime.value = new Date()
}
function startTimer() {
    if (timer != undefined) return
    timer = setInterval(updateTime, 0.1 * 1000 /*0.1s*/)
}
function stopTimer() {
    clearTimeout(timer)
    timer = undefined
}
const timeFormat = Intl.DateTimeFormat("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })
let displayTime = computed(() => {
    const time = currentTime.value
    return timeFormat.format(time)
})


const journeys: Journey[] = []
const currentTrains = ref<Train[]>([])
const currentTrainMarkers = computed<Marker[]>(() => {
    return currentTrains.value.map(t => {
        return {
            position: t.position,
            sprite: t.line,
        }
    })
})

async function updateJourneys() {
    if (tramRepo.value == null) return

    const departures = await tramRepo.value.current()
    journeys.splice(0, journeys.length)
    for (const track of tracks) {
        journeys.push(...journeysInTrack(track, departures))
    }
}

function journeysInTrack(track: [Station, Station], departures: TramDeparture[]): Journey[] {
    const startDepartures = departures.filter(d => d.station == track[0])
    const endDepartures = departures.filter(d => d.station == track[1])
    const currentTime = new Date()

    return startDepartures
        .map(departure => matchToJourney(departure, endDepartures))
        .filter(j => j != null)
        .map(j => j as Journey)
        .filter(journey => {
            return new Date(journey[0].realtime) >= currentTime
                || new Date(journey[1].realtime) >= currentTime
        })
}

function matchToJourney(departure: TramDeparture, otherDepartures: TramDeparture[]): Journey | null {
    for (const otherDeparture of otherDepartures) {
        // Two adjacent departures with the same train number are a journey
        if (otherDeparture.trainNumber == departure.trainNumber) {
            return [departure, otherDeparture] as Journey
        }
    }
    return null
}

watch(() => currentTime.value, time => {
    const activeJourneys = journeys.filter(s => {
        return isTrainActiveInSection(new Date(s[0].realtime), new Date(s[1].realtime), time)
    })
    currentTrains.value = activeJourneys.map(calcTrainPosition)
})

function calcTrainPosition(journey: Journey): Train {
    const startTime = new Date(journey[0].realtime)
    const endTime = new Date(journey[1].realtime)
    const timeDifference = endTime.getTime() - startTime.getTime()
    const factor = (currentTime.value.getTime() - startTime.getTime()) / timeDifference

    const startStation = stationGeopositions[journey[0].station]
    const endStation = stationGeopositions[journey[1].station]
    const currentPosition = interpolateCoordinates(startStation, endStation, factor, easeInOutQuad)
    return { position: currentPosition, line: journey[0].line }
}

function isTrainActiveInSection(departure: Date, arrival: Date, time: Date): boolean {
    const departureInPast = departure < time
    const arrivalInFuture = arrival > time
    return departureInPast && arrivalInFuture
}

onMounted(async () => {
    const baseStore = await BaseStore.open()
    tramRepo.value = baseStore.repo<TramDeparture>(BaseRepo.TramDepartures)
    tramRepo.value.onUpdate(() => updateJourneys())
    updateJourneys()

    startTimer()
    props.bus.onResume(() => {
        startTimer()
    })
    props.bus.onSuspend(() => {
        stopTimer()
    })
})


</script>

<template>
    <div style="height: calc(100vh); width: 100%">

        <LocationFrame :center="center" :zoom="zoom" #default="data">
            <TileRenderer v-bind="data" :tiles="tileProvider"></TileRenderer>
            <LineRenderer v-bind="data" :lines="stationLines" :color="VELVET"></LineRenderer>
            <MarkerRenderer v-bind="data" :marker="stationMarker" :sprites="spriteManager" :size="20"></MarkerRenderer>
            <MarkerRenderer v-bind="data" :marker="currentTrainMarkers" :sprites="spriteManager" :size="20">
            </MarkerRenderer>
        </LocationFrame>

        <div class="current-time">
            <span class="live-dot" active="true"></span>
            {{ displayTime }}
        </div>

    </div>
</template>

<style scoped></style>