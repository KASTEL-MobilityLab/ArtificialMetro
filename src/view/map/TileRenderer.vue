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
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
            ctx.fillText(`${x + props.tileBounds.topLeft.x},${y + props.tileBounds.topLeft.y}`, x * TILE_SIZE + 10, y * TILE_SIZE + 10)
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
    renderTiles()
    showTiles(props.offset)

    props.tiles.fetchTile({x: 8573, y: 5625, scale: 14}).then(tile => {
        console.log('got tile')
        const ctx = canvas.value?.getContext('2d') ?? null
        ctx?.drawImage(tile, 20, 20)
        return null
    })
})
</script>

<template>
    <canvas ref="canvas"></canvas>
</template>