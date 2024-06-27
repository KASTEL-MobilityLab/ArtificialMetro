<script setup lang="ts">
import type { Coordinate } from '@/model/vehicles';
import { computed, ref, watch } from 'vue';
import { type BoundingBox, TILE_SIZE, tileFromCoords, type Dimensions, type TileCoordinate } from './tiles';

const props = defineProps<{
    center: Coordinate,
    zoom: number,
}>()

const container = ref<HTMLDivElement|undefined>()
const width = ref(0)
const height = ref(0)

watch(() => container.value, () => {
    if (container.value == undefined) return
    const sizeWatcher = new ResizeObserver(() => {
        updateDimensions()
    })
    sizeWatcher.observe(container.value)
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
const topLeftTile = computed<TileCoordinate>(() => {
    const horizontalCenter = Math.ceil(width.value / 2)
    const tilesOnLeft = Math.ceil(horizontalCenter / TILE_SIZE)
    const firstX = centerTile.value.x - tilesOnLeft
    const verticalCenter = Math.ceil(height.value / 2)
    const tilesAbove = Math.ceil(verticalCenter / TILE_SIZE)
    const firstY = centerTile.value.y - tilesAbove
    return {
        x: firstX,
        y: firstY,
        scale: props.zoom,
    }
})
const bottomRightTile = computed<TileCoordinate>(() => {
    const horizontalCenter = Math.ceil(width.value / 2)
    const tilesOnLeft = Math.ceil(horizontalCenter / TILE_SIZE)
    const firstX = centerTile.value.x - tilesOnLeft
    const verticalCenter = Math.ceil(height.value / 2)
    const tilesAbove = Math.ceil(verticalCenter / TILE_SIZE)
    const firstY = centerTile.value.y - tilesAbove
    return {
        x: firstX + 2 * tilesOnLeft + 1,
        y: firstY + 2 * tilesAbove + 1,
        scale: props.zoom,
    }
})
const tileBounds = computed<BoundingBox<TileCoordinate>>(() => {
    return {
        topLeft: topLeftTile.value,
        bottomRight: bottomRightTile.value,
    }
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
            :center="center" 
            :zoom="zoom"
            :viewport-dimensions="viewportDimensions"
            :offset="{y: verticalOffset, x: horizontalOffset}"
            :tile-bounds="tileBounds"
            ></slot>
    </div>
</template>

<style scoped>
.location-frame {
    display: block;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}
.location-frame > canvas {
    position: absolute;
    top: 0;
    left: 0;
}
</style>