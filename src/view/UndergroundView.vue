<script setup lang="ts">
import LocationFrame from './map/LocationFrame.vue';
import TileRenderer from './map/TileRenderer.vue';
import MarkerRenderer from './map/MarkerRenderer.vue';
import type { SwitchBusReceiver } from './switch_bus';
import { TileProvider } from './map/tile_provider';
import { SpriteManager } from './map/sprite_manager';
import { tramStation } from '@/model/brands';
import type { Marker } from './map/tiles';
import type { Coordinate } from '@/model/vehicles';
import { onMounted, ref } from 'vue';
import LineRenderer from './map/LineRenderer.vue';

const VELVET = "#902C3E" // Velvet Underground

defineProps<{
    bus: SwitchBusReceiver,
}>()

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
const stationConnectios = [
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

</script>

<template>
    <div style="height: calc(100vh); width: 100%">

        <LocationFrame :center="center" :zoom="zoom" #default="data">
            <TileRenderer v-bind="data" :tiles="tileProvider"></TileRenderer>
            <LineRenderer v-bind="data" :lines="stationConnectios" :color="VELVET"></LineRenderer>
            <MarkerRenderer v-bind="data" :marker="stationMarker" :sprites="spriteManager" :size="20"></MarkerRenderer>
        </LocationFrame>

    </div>
</template>

<style scoped></style>