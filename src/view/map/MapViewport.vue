<script setup lang="ts">
import type { Coordinate } from '@/model/vehicles';
import { ref, watch } from 'vue';
import { TILE_SIZE, type Dimensions } from './tiles';

const props = defineProps<{
    center: Coordinate,
    offset: {
        x: number,
        y: number,
    },
    viewportDimensions: Dimensions,
}>()

const canvas = ref<HTMLCanvasElement|undefined>()

function render() {
    if (canvas.value == undefined) return
    const ctx = canvas.value.getContext('2d')
    if (ctx == null) return
    for (let x = props.offset.x; x < 1000; x += TILE_SIZE) {
        ctx.beginPath()
        ctx.lineWidth = 5
        ctx.strokeStyle = "black"
        ctx.moveTo(x, 20)
        ctx.lineTo(x, 2000)
        ctx.stroke()
        console.log(x)
    }
}

watch(() => props.offset, () => {
    render()
})
watch(() => props.viewportDimensions, dim => {
    if (canvas.value == undefined) return
    canvas.value.width = dim.width
    canvas.value.height = dim.height
    render()
})
</script>

<template>
    <canvas ref="canvas" width="600" height="600"></canvas>
</template>