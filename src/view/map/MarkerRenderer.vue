<script setup lang="ts">
import type { Coordinate } from '@/model/vehicles';
import { ref, watch } from 'vue';
import { TILE_SIZE, coordsFromTile, posOnTile, tileFromCoords, type BoundingBox, type Dimensions, type Marker, type Offset, type TileCoordinate, type ViewCoordinate } from './tiles';

const props = defineProps<{
    center: Coordinate,
    zoom: number,
    offset: Offset<ViewCoordinate>,
    viewportDimensions: Dimensions,
    tileBounds: BoundingBox<TileCoordinate>,
    marker: Marker[],
}>()

const markerCanvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE)
const canvas = ref<HTMLCanvasElement|undefined>()
let horizontalTiles = 0
let verticalTiles = 0

function resizeTileCanvas() {
    horizontalTiles = Math.ceil(props.viewportDimensions.width / TILE_SIZE) + 1
    verticalTiles = Math.ceil(props.viewportDimensions.height / TILE_SIZE) + 1
    markerCanvas.width = horizontalTiles * TILE_SIZE
    markerCanvas.height = verticalTiles * TILE_SIZE
}

function resizeViewportCanvas(dim: Dimensions) {
    if (canvas.value == undefined) return
    canvas.value.width = dim.width
    canvas.value.height = dim.height
}

function renderMarkers() {
    const ctx = markerCanvas.getContext('2d')
    if (ctx == null) return
    ctx.clearRect(0, 0, markerCanvas.width, markerCanvas.height)

    for (const marker of props.marker) {
        const tile = tileFromCoords(marker.position, props.zoom)
        const relativeTile = {
            x: tile.x - props.tileBounds.topLeft.x,
            y: tile.y - props.tileBounds.topLeft.y,
        }
        const offset = posOnTile(marker.position, props.zoom)
        ctx.fillRect(relativeTile.x * TILE_SIZE + offset.x, relativeTile.y * TILE_SIZE + offset.y, 20, 20)
    }
}

function showMarkers(offset: Offset<ViewCoordinate>) {
    const ctx = canvas.value?.getContext('2d') ?? null
    if (ctx == null) return
    ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
    ctx.drawImage(markerCanvas, offset.x, offset.y)
}

watch(() => props.offset, () => {
    showMarkers(props.offset)
})
watch(() => props.viewportDimensions, dim => {
    resizeViewportCanvas(dim)
    resizeTileCanvas()
    renderMarkers()
    showMarkers(props.offset)
})
watch(() => props.tileBounds, () => {
    renderMarkers()
    showMarkers(props.offset)
})
watch(() => props.marker, () => {
    renderMarkers()
    showMarkers(props.offset)
})
</script>

<template>
    <canvas ref="canvas"></canvas>
</template>

<style scoped>
canvas {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
}
</style>