<script setup lang="ts">
import type { Coordinate } from './Coordinate';
import { onMounted, ref, watch } from 'vue';
import { TILE_SIZE, type BoundingBox, type Dimensions, type Offset, type TileCoordinate, type ViewCoordinate } from './tiles';
import type { TileProvider } from './tile_provider';

const props = defineProps<{
    center: Coordinate,
    offset: Offset<ViewCoordinate>,
    viewportDimensions: Dimensions,
    tileBounds: BoundingBox<TileCoordinate>,
    tiles: TileProvider,
}>()

const tileCanvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE)
const canvas = ref<HTMLCanvasElement | undefined>()

function resizeTileCanvas(dim: Dimensions) {
    const horizontalTiles = Math.ceil(dim.width / TILE_SIZE) + 1
    const verticalTiles = Math.ceil(dim.height / TILE_SIZE) + 1
    tileCanvas.width = horizontalTiles * TILE_SIZE
    tileCanvas.height = verticalTiles * TILE_SIZE
}

function resizeViewportCanvas(dim: Dimensions) {
    if (canvas.value == undefined) return
    canvas.value.width = dim.width
    canvas.value.height = dim.height
}

function renderTiles() {
    const ctx = tileCanvas.getContext('2d')
    if (ctx == null) return

    const horizontalTiles = props.tileBounds.bottomRight.x - props.tileBounds.topLeft.x
    const verticalTiles = props.tileBounds.bottomRight.y - props.tileBounds.topLeft.y

    for (let x = 0; x < horizontalTiles; ++x) {
        for (let y = 0; y < verticalTiles; ++y) {
            const coords = {
                x: x + props.tileBounds.topLeft.x,
                y: y + props.tileBounds.topLeft.y,
                scale: props.tileBounds.topLeft.scale
            }
            const tile = props.tiles.getTile(coords)
            ctx.drawImage(tile, x * TILE_SIZE, y * TILE_SIZE)
        }
    }
}

function showTiles(offset: Offset<ViewCoordinate>) {
    const ctx = canvas.value?.getContext('2d') ?? null
    if (ctx == null) return
    ctx.drawImage(tileCanvas, offset.x, offset.y)
}

function doResize(dimensions: Dimensions) {
    resizeViewportCanvas(dimensions)
    resizeTileCanvas(dimensions)
}

async function renderAndShowTiles() {
    await props.tiles.fetchRange(props.tileBounds)
    renderTiles()
    showTiles(props.offset)
}

watch(() => props.offset, () => {
    showTiles(props.offset)
})
watch(() => props.viewportDimensions, dim => {
    doResize(dim)
    renderAndShowTiles()
})
watch(() => props.tileBounds, () => {
    renderAndShowTiles()
})
onMounted(() => {
    doResize(props.viewportDimensions)
    renderAndShowTiles()
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