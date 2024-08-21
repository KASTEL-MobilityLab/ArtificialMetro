<script setup lang="ts">
import LocationFrame from './map/LocationFrame.vue';
import TileRenderer from './map/TileRenderer.vue';
import MarkerRenderer from './map/MarkerRenderer.vue';
import type { SwitchBusReceiver } from './switch_bus';
import { TileProvider } from './map/tile_provider';
import { SpriteManager } from './map/sprite_manager';
import { tramLines, tramStation } from '@/model/brands';
import type { Marker } from './map/tiles';
import type { TramDeparture, Coordinate } from '@/model/vehicles';
import LineRenderer from './map/LineRenderer.vue';
import { computed, onMounted, ref, watch } from 'vue';
import { BaseStore } from '@/storage/base_store';
import { BaseRepo } from '@/model/repos';
import type { CacheRepo } from '@/storage/cache_repo';
import { easeInOutCubic, easeInOutQuad, easeInOutSine, interpolateCoordinates } from './map/Coordinate';

const VELVET = "#902C3E" // Velvet Underground

defineProps<{
    bus: SwitchBusReceiver,
}>()

let tramRepo = ref<CacheRepo<TramDeparture, BaseRepo> | null>(null)

let zoom = 16
let center = { lon: 8.41, lat: 49.0054 }
const tileProvider = new TileProvider("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png")

enum Station {
    MarktplatzKaiserstrasse = "7001003",
    MarktplatzPyramide = "7001011",
    Europaplatz = "7001004",
    EttlingerTor = "7001012",
    Kongresszentrum = "7001013",
    Kronenplatz = "7001002",
    DurlacherTor = "7001001",
}

const stationLocations: { [key: string]: Coordinate } = {
    [Station.MarktplatzKaiserstrasse]: { lat: 49.009656, lon: 8.403112 },
    [Station.MarktplatzPyramide]: { lat: 49.009302, lon: 8.403918 },
    [Station.Europaplatz]: { lat: 49.010013, lon: 8.395048 },
    [Station.EttlingerTor]: { lat: 49.005444, lon: 8.403502 },
    [Station.Kongresszentrum]: { lat: 49.002508, lon: 8.403188 },
    [Station.Kronenplatz]: { lat: 49.009249, lon: 8.410788 },
    [Station.DurlacherTor]: { lat: 49.008749, lon: 8.418109 },
}

const connections: [Station, Station][] = [
    [Station.DurlacherTor, Station.Kronenplatz],
    [Station.Kronenplatz, Station.MarktplatzKaiserstrasse],
    [Station.Kronenplatz, Station.MarktplatzPyramide],
    [Station.MarktplatzKaiserstrasse, Station.Europaplatz],
    [Station.MarktplatzPyramide, Station.EttlingerTor],
    [Station.EttlingerTor, Station.Kongresszentrum],
]

const relevantSections = [connections, connections.map(c => [c[1], c[0]])].flat() as [Station, Station][]


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

const spriteManager = new SpriteManager()
spriteManager.fetchSprite({
    name: 'station',
    size: 20,
    url: tramStation,
})
Object.keys(tramLines).forEach(line => {
    const brand = tramLines[line]
    const canvas = new OffscreenCanvas(20, 20)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = brand.color
    ctx.beginPath()
    ctx.roundRect(0, 0, 20, 20, 3)
    ctx.fill()
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    ctx.font = "bold 15px sans-serif"
    ctx.fillText(line, 10, 15)
    spriteManager.registerSprite({ name: line, size: 20 }, canvas)
})

const currentTime = ref(new Date())
function updateTime() {
    currentTime.value = new Date()
}

type Section = [TramDeparture, TramDeparture]
const sections: Section[] = []
const currentTrains = ref<{ position: Coordinate, line: string }[]>([])
const currentTrainMarkers = computed<Marker[]>(() => {
    return currentTrains.value.map(t => {
        return {
            position: t.position,
            sprite: t.line,
        }
    })
})

onMounted(async () => {
    const baseStore = await BaseStore.open()
    tramRepo.value = baseStore.repo<TramDeparture>(BaseRepo.TramDepartures)
    tramRepo.value.onUpdate(() => updateAllSections())
    updateAllSections()

    setInterval(updateTime, 0.1 * 1000 /*0.5s*/)
})

async function updateAllSections() {
    if (tramRepo.value == null) return
    const departures = await tramRepo.value.current()
    sections.splice(0, sections.length)
    for (const section of relevantSections) {
        updateSection(section, departures)
    }
}

async function updateSection(section: [Station, Station], departures: TramDeparture[]) {
    const startDepartures = departures.filter(d => d.station == section[0])
    const endDepartures = departures.filter(d => d.station == section[1])
    const currentTime = new Date()

    sections.push(...startDepartures
        .map(d => matchDeparture(d, endDepartures))
        .filter(d => d != null)
        .map(d => d as Section)
        .filter(d => new Date(d[0].realtime) >= currentTime || new Date(d[1].realtime) >=  currentTime)
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
        return trainActiveInSection(new Date(s[0].realtime), new Date(s[1].realtime), time)
    })
    currentTrains.value = activeTrains.map(train => {
        const startTime = new Date(train[0].realtime)
        const endTime = new Date(train[1].realtime)
        const timeDifference = endTime.getTime() - startTime.getTime()
        const factor = (currentTime.value.getTime() - startTime.getTime()) / timeDifference

        const startStation = stationLocations[train[0].station]
        const endStation = stationLocations[train[1].station]
        const currentPosition = interpolateCoordinates(startStation, endStation, factor, easeInOutQuad)
        return { position: currentPosition, line: train[0].line }
    })
})

function trainActiveInSection(departure: Date, arrival: Date, time: Date): boolean {
    const departureInPast = departure < time
    const arrivalInFuture = arrival > time
    return departureInPast && arrivalInFuture
}
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