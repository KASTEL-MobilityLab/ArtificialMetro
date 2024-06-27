<script setup lang="ts">
import type { Coordinate } from '@/model/vehicles';
import { ref, watch } from 'vue';
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
const canvas = ref<HTMLCanvasElement|undefined>()
let horizontalTiles = 0
let verticalTiles = 0

function resizeTileCanvas() {
    horizontalTiles = Math.ceil(props.viewportDimensions.width / TILE_SIZE) + 1
    verticalTiles = Math.ceil(props.viewportDimensions.height / TILE_SIZE) + 1
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
    const horizontalTiles = props.tileBounds.bottomRight.x - props.tileBounds.topLeft.x
    const verticalTiles = props.tileBounds.bottomRight.y - props.tileBounds.topLeft.y

    if (ctx == null) return
    for (let x = 0; x < horizontalTiles; ++x) {
        for (let y = 0; y < verticalTiles; ++y) {
            const tile = props.tiles.getTile({x: x + props.tileBounds.topLeft.x, y: y + props.tileBounds.topLeft.y, scale: props.tileBounds.topLeft.scale})
            ctx.drawImage(tile, x * TILE_SIZE, y * TILE_SIZE)
        }
    }
}

function showTiles(offset: Offset<ViewCoordinate>) {
    const ctx = canvas.value?.getContext('2d') ?? null
    if (ctx == null) return
    ctx.drawImage(tileCanvas, offset.x, offset.y)
}

watch(() => props.offset, () => {
    showTiles(props.offset)
})
watch(() => props.viewportDimensions, dim => {
    resizeViewportCanvas(dim)
    resizeTileCanvas()
    props.tiles.fetchRange(props.tileBounds).then(() => {
        renderTiles()
        showTiles(props.offset)
    })
})
</script>

<template>
    <canvas ref="canvas"></canvas>
</template>