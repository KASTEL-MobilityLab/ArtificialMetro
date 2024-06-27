<script setup lang="ts">
import type { Coordinate } from '@/model/vehicles';
import { onMounted, ref, watch } from 'vue';
import { TILE_SIZE, posOnTile, tileFromCoords, type BoundingBox, type Dimensions, type Marker, type Offset, type TileCoordinate, type ViewCoordinate } from './tiles';
import type { SpriteManager } from './sprite_manager';

const props = defineProps<{
    center: Coordinate,
    zoom: number,
    offset: Offset<ViewCoordinate>,
    viewportDimensions: Dimensions,
    tileBounds: BoundingBox<TileCoordinate>,
    marker: Marker[],
    sprites: SpriteManager,
    size: number,
}>()

const markerCanvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE)
const canvas = ref<HTMLCanvasElement | undefined>()
let horizontalTiles = 0
let verticalTiles = 0

function resizeTileCanvas(dimensions: Dimensions) {
    horizontalTiles = Math.ceil(dimensions.width / TILE_SIZE) + 1
    verticalTiles = Math.ceil(dimensions.height / TILE_SIZE) + 1
    markerCanvas.width = horizontalTiles * TILE_SIZE
    markerCanvas.height = verticalTiles * TILE_SIZE
}

function resizeViewportCanvas(dimensions: Dimensions) {
    if (canvas.value == undefined) return
    canvas.value.width = dimensions.width
    canvas.value.height = dimensions.height
}

function renderMarkers() {
    const ctx = markerCanvas.getContext('2d')
    if (ctx == null) return
    ctx.clearRect(0, 0, markerCanvas.width, markerCanvas.height)

    for (const marker of props.marker) {
        drawMarker(marker, ctx)
    }
}

function drawMarker(marker: Marker, ctx: OffscreenCanvasRenderingContext2D) {
    const { tile, offset } = relativeTile(marker)
    const sprite = props.sprites.getSprite({ name: marker.sprite, size: props.size })
    const markerOffset = props.size / 2
    const position = {
        x: tile.x * TILE_SIZE + offset.x - markerOffset,
        y: tile.y * TILE_SIZE + offset.y - markerOffset,
    }
    ctx.drawImage(sprite, position.x, position.y)
}

function relativeTile(marker: Marker): { tile: TileCoordinate, offset: Offset<ViewCoordinate> } {
    const tile = tileFromCoords(marker.position, props.zoom)
    const relativeTile = {
        x: tile.x - props.tileBounds.topLeft.x,
        y: tile.y - props.tileBounds.topLeft.y,
        scale: tile.scale,
    }
    const offset = posOnTile(marker.position, props.zoom)
    return {
        tile: relativeTile,
        offset,
    }
}

function showMarkers(offset: Offset<ViewCoordinate>) {
    const ctx = canvas.value?.getContext('2d') ?? null
    if (ctx == null) return
    ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
    ctx.drawImage(markerCanvas, offset.x, offset.y)
}

function doResize(dimensions: Dimensions) {
    resizeViewportCanvas(dimensions)
    resizeTileCanvas(dimensions)
}

function renderAndShowMarkers() {
    renderMarkers()
    showMarkers(props.offset)
}

watch(() => props.offset, () => {
    showMarkers(props.offset)
})
watch(() => props.viewportDimensions, dim => {
    doResize(dim)
    renderAndShowMarkers()
})
watch(() => props.tileBounds, () => {
    renderAndShowMarkers()
})
watch(() => props.marker, () => {
    renderAndShowMarkers()
})
onMounted(() => {
    doResize(props.viewportDimensions)
    renderAndShowMarkers()
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