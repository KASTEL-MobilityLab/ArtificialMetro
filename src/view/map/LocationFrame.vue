<script setup lang="ts">
import type { Coordinate } from '@/model/vehicles';
import { computed, ref, watch } from 'vue';
import { TILE_SIZE, tileFromCoords, type Dimensions } from './tiles';

const props = defineProps<{
    center: Coordinate,
    zoom: number,
}>()

const container = ref<HTMLDivElement|undefined>()
watch(() => container.value, () => {
    if (container.value == undefined) return
    const sizeWatcher = new ResizeObserver(() => {
        updateDimensions()
    })
    sizeWatcher.observe(container.value)
})


const width = ref(2000)
const height = ref(600)
const numHorizontalTiles = computed(() => {
    const num = width.value / TILE_SIZE
    return (num % 1 == 0) ? num : Math.floor(num)
})
const numVerticalTiles = computed(() => {
    const num = height.value / TILE_SIZE
    return (num % 1 == 0) ? num : Math.floor(num)
})
function updateDimensions() {
    width.value = container.value?.offsetWidth ?? 0
    height.value = container.value?.offsetHeight ?? 0
}
const viewportDimensions = computed(() => {
    return {
        width: width.value,
        height: height.value,
    } as Dimensions
})


const centerTile = computed(() => {
    return tileFromCoords(props.center, props.zoom)
})
const horizontalTiles = computed(() => {
    const center = Math.ceil(width.value / 2)
    const tilesOnLeft = Math.ceil(center / TILE_SIZE)
    const firstX = centerTile.value.x - tilesOnLeft
    const lastX = firstX + 2 * tilesOnLeft + 1
    const { y, scale } = centerTile.value
    const tiles = []
    for (let x = firstX; x < lastX; ++x) {
        tiles.push({x, y, scale})
    }
    return tiles
})
const verticalTiles = computed(() => {
    const center = Math.ceil(height.value / 2)
    const tilesAbove = Math.ceil(center / TILE_SIZE)
    const firstY = centerTile.value.y - tilesAbove
    const lastY = firstY + 2 * tilesAbove + 1
    const { x, scale } = centerTile.value
    const tiles = []
    for (let y = firstY; y < lastY; ++y) {
        tiles.push({x, y, scale})
    }
    return tiles
})
const horizontalOffset = computed(() => {
    const center = Math.ceil(width.value / 2)
    const tilesOnLeft = Math.ceil(center / TILE_SIZE)
    return center - tilesOnLeft * TILE_SIZE
})
const verticalOffset = computed(() => {
    const center = Math.ceil(height.value / 2)
    const tilesAbove = Math.ceil(center / TILE_SIZE)
    return center - tilesAbove * TILE_SIZE
})
</script>

<template>
    <div ref="container" class="location-frame">
        <slot 
            :center="centerTile" 
            :viewport-dimensions="viewportDimensions"
            :offset="{y: verticalOffset, x: horizontalOffset}"
            ></slot>
    </div>
</template>

<style scoped>
.location-frame {
    display: block;
    width: 100vw;
    height: 100vh;
}
</style>