<script setup lang="ts">
import LocationFrame from './map/LocationFrame.vue';
import TileRenderer from './map/TileRenderer.vue';
import MarkerRenderer from './map/MarkerRenderer.vue';
import type { SwitchBusReceiver } from './switch_bus';
import { TileProvider } from './map/tile_provider';
import { SpriteManager } from './map/sprite_manager';
import { tramLineSprite, tramLines, tramStationSprite } from '@/model/brands';
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
const STATION_SPRITE_SIZE = 20
const TRAIN_SPRITE_SIZE = 24

type Journey = { origin: TramDeparture, destination: TramDeparture, outdated: boolean }
type Train = { position: Coordinate, line: string, outdated: boolean }

const props = defineProps<{
    bus: SwitchBusReceiver,
}>()

let tramRepo = ref<CacheRepo<TramDeparture, BaseRepo> | null>(null)

let zoom = 16
let center = { lon: 8.41, lat: 49.0054 }
const tileProvider = new TileProvider("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png")

const spriteManager = new SpriteManager()
const stationSprite = tramStationSprite(VELVET, STATION_SPRITE_SIZE)
if (stationSprite) spriteManager.registerSprite({ name: 'station', size: STATION_SPRITE_SIZE }, stationSprite)
Object.keys(tramLines).forEach(line => {
    const sprite = tramLineSprite(line, TRAIN_SPRITE_SIZE)
    if (sprite) {
        spriteManager.registerSprite({ name: line, size: TRAIN_SPRITE_SIZE }, sprite)
    }
    const relicSprite = tramLineSprite(line, TRAIN_SPRITE_SIZE, "#666")
    if (relicSprite) {
        spriteManager.registerSprite({ name: `${line}-relic`, size: TRAIN_SPRITE_SIZE }, relicSprite)
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

let timer: NodeJS.Timeout | undefined = undefined
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


let journeys: Journey[] = []
const currentTrains = ref<Train[]>([])
const currentTrainMarkers = computed<Marker[]>(() => {
    return currentTrains.value.map(t => {
        return {
            position: t.position,
            sprite: t.outdated ? `${t.line}-relic` : t.line,
        }
    })
})

async function updateJourneys() {
    if (tramRepo.value == null) return

    const tempJourneys = cleanOldJourneys(journeys)
    taintAllJourneys(tempJourneys)

    const departures = await tramRepo.value.current()
    const newJourneys: Journey[] = []
    for (const track of tracks) {
        newJourneys.push(...journeysInTrack(track, departures))
    }
    insertNewJourneys(tempJourneys, newJourneys)
    tempJourneys.sort((a, b) => a.origin.line < b.origin.line ? -1 : a.origin.line == b.origin.line ? 0 : 1)
    journeys = tempJourneys
}


function cleanOldJourneys(journeys: Journey[]): Journey[] {
    const fiveMinAgo = new Date((new Date()).getTime() - 5 * 60 * 1000 /*5min*/)
    return journeys.filter(j => {
        return new Date(j.destination.realtime) >= fiveMinAgo
    })
}

function taintAllJourneys(journeys: Journey[]) {
    for (let journey of journeys) {
        journey.outdated = true
    }
}

function insertNewJourneys(journeys: Journey[], newJourneys: Journey[]) {
    for (const journey of newJourneys) {
        insertNewJourney(journeys, journey)
    }
}

function insertNewJourney(journeys: Journey[], journey: Journey) {
    for (let j of journeys) {
        if (j.origin.trainNumber != journey.origin.trainNumber) {
            continue
        }
        if (j.origin.realtime == journey.origin.realtime && j.destination.realtime == journey.destination.realtime) {
            // nothing has changed -> don't taint anymore
            j.outdated = false
            return
        }
    }
    // no previous entry was validated again -> add a new non-relic entry
    journeys.push(journey)
}

function journeysInTrack(track: [Station, Station], departures: TramDeparture[]): Journey[] {
    const startDepartures = departures.filter(d => d.station == track[0])
    const endDepartures = departures.filter(d => d.station == track[1])
    const currentTime = new Date()
    const inQuarterHour = new Date((new Date()).getTime() + 15 * 60 * 1000 /*15min*/)

    return startDepartures
        .map(departure => matchToJourney(departure, endDepartures))
        .filter(j => j != null)
        .map(j => j as Journey)
        .filter(journey => {
            return new Date(journey.destination.realtime) >= currentTime && new Date(journey.origin.realtime) < inQuarterHour
        })
}

function matchToJourney(departure: TramDeparture, otherDepartures: TramDeparture[]): Journey | null {
    for (const otherDeparture of otherDepartures) {
        // Two adjacent departures with the same train number are a journey
        if (otherDeparture.trainNumber == departure.trainNumber) {
            if (new Date(departure.realtime) <= new Date(otherDeparture.realtime)) {
                return { origin: departure, destination: otherDeparture, outdated: false }
            } else {
                return { origin: otherDeparture, destination: departure, outdated: false }
            }
        }
    }
    return null
}

watch(() => currentTime.value, time => {
    const activeJourneys = journeys.filter(s => {
        return isTrainActiveInSection(new Date(s.origin.realtime), new Date(s.destination.realtime), time)
    })
    currentTrains.value = activeJourneys.map(calcTrainPosition)
})

function calcTrainPosition(journey: Journey): Train {
    const startTime = new Date(journey.origin.realtime)
    const endTime = new Date(journey.destination.realtime)
    const timeDifference = endTime.getTime() - startTime.getTime()
    const factor = (currentTime.value.getTime() - startTime.getTime()) / timeDifference

    const startStation = stationGeopositions[journey.origin.station]
    const endStation = stationGeopositions[journey.destination.station]
    const currentPosition = interpolateCoordinates(startStation, endStation, factor, easeInOutQuad)
    return { position: currentPosition, line: journey.origin.line, outdated: journey.outdated }
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
            <MarkerRenderer v-bind="data" :marker="stationMarker" :sprites="spriteManager" :size="STATION_SPRITE_SIZE">
            </MarkerRenderer>
            <MarkerRenderer v-bind="data" :marker="currentTrainMarkers" :sprites="spriteManager"
                :size="TRAIN_SPRITE_SIZE">
            </MarkerRenderer>
        </LocationFrame>

        <div class="current-time">
            <span class="live-dot" active="true"></span>
            {{ displayTime }}
        </div>
    </div>
</template>

<style scoped>
</style>