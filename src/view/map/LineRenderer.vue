<script setup lang="ts">
import type { Coordinate } from '@/model/vehicles';
import { onMounted, ref, watch } from 'vue';
import { TILE_SIZE, posOnTile, tileFromCoords, type BoundingBox, type Dimensions, type Marker, type Offset, type TileCoordinate, type ViewCoordinate } from './tiles';
import type { SpriteManager } from './sprite_manager';

export type Line = { start: Coordinate, end: Coordinate }

const props = defineProps<{
    center: Coordinate,
    zoom: number,
    offset: Offset<ViewCoordinate>,
    viewportDimensions: Dimensions,
    tileBounds: BoundingBox<TileCoordinate>,
    lines: Line[],
    color: string,
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

function renderLines() {
    const ctx = markerCanvas.getContext('2d')
    if (ctx == null) return
    ctx.clearRect(0, 0, markerCanvas.width, markerCanvas.height)

    for (const line of props.lines) {
        drawLine(line, ctx)
    }
}

function drawLine(line: Line, ctx: OffscreenCanvasRenderingContext2D) {
    const start = relativeTile(line.start)
    const end = relativeTile(line.end)
    const startPos = {x: start.tile.x * TILE_SIZE + start.offset.x, y: start.tile.y * TILE_SIZE + start.offset.y}
    const endPos = {x: end.tile.x * TILE_SIZE + end.offset.x, y: end.tile.y * TILE_SIZE + end.offset.y}
    ctx.strokeStyle = props.color
    ctx.lineCap = "round"
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.moveTo(startPos.x, startPos.y)
    ctx.lineTo(endPos.x, endPos.y)
    ctx.stroke()
}

function relativeTile(position: Coordinate): { tile: TileCoordinate, offset: Offset<ViewCoordinate> } {
    const tile = tileFromCoords(position, props.zoom)
    const relativeTile = {
        x: tile.x - props.tileBounds.topLeft.x,
        y: tile.y - props.tileBounds.topLeft.y,
        scale: tile.scale,
    }
    const offset = posOnTile(position, props.zoom)
    return {
        tile: relativeTile,
        offset,
    }
}

function showLines(offset: Offset<ViewCoordinate>) {
    const ctx = canvas.value?.getContext('2d') ?? null
    if (ctx == null) return
    ctx.clearRect(0, 0, canvas.value!.width, canvas.value!.height)
    ctx.drawImage(markerCanvas, offset.x, offset.y)
}

function doResize(dimensions: Dimensions) {
    resizeViewportCanvas(dimensions)
    resizeTileCanvas(dimensions)
}

function renderAndShowLines() {
    renderLines()
    showLines(props.offset)
}

watch(() => props.offset, () => {
    showLines(props.offset)
})
watch(() => props.viewportDimensions, dim => {
    doResize(dim)
    renderAndShowLines()
})
watch(() => props.tileBounds, () => {
    renderAndShowLines()
})
watch(() => props.lines, () => {
    renderAndShowLines()
})
onMounted(() => {
    doResize(props.viewportDimensions)
    renderAndShowLines()
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