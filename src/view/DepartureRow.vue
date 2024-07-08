<script setup lang="ts">
import { tramLines } from '@/model/brands';
import type { TramDeparture } from '@/model/vehicles';
import { computed } from 'vue';

const timeFormat = Intl.DateTimeFormat("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })

const props = defineProps<{
    departure: TramDeparture,
}>()

function formatTime(time: string): string {
    try {
        return timeFormat.format(new Date(time))
    } catch {
        return ""
    }
}

const plannedTime = computed(() => formatTime(props.departure.planned as any))
const realTime = computed(() => {
    const planned = props.departure.planned
    const realtime = props.departure.realtime
    if (realtime == planned) {
        return null
    } else {
        return formatTime(realtime as any)
    }
})
const line = computed(() => props.departure.line)
const lineColor = computed(() => {
    if (line.value in tramLines) {
        return tramLines[line.value].color
    } else {
        return "grey"
    }
})
const transportType =computed(() => {
    if (line.value in tramLines) {
        return tramLines[line.value].type
    } else {
        return "tram"
    }
})

</script>

<template>
    <div class="departure-row">
        <span class="line" :class="transportType" :style="{ backgroundColor: lineColor }">{{ line }}</span>
        <span class="times">
            <span class="time" :class="{ invalid: realTime != null }">
                {{ plannedTime }}
            </span>
            <span class="time realtime" v-if="realTime">
                {{ realTime }}
            </span>
        </span>

        <span class="direction">
            {{ departure.direction }}
        </span>
        <span class="platform">
            Platform {{ departure.track }}
        </span>
    </div>
</template>

<style scoped>
.departure-row {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    gap: 20px;

    padding: 15px 40px;
}

.times {
    display: flex;
    flex-direction: column;

    justify-content: flex-start;
    align-items: flex-start;
}

.time {
    font-size: 20px;
    min-width: 60px;
}

.time.invalid {
    text-decoration: line-through;
}

.realtime {
    color: var(--accent-color);
}

.line {
    display: flex;
    flex-direction: row;

    justify-content: center;
    align-items: center;

    width: 50px;
    height: 50px;

    background-color: var(--accent-bg-color);
    color: var(--accent-fg-color);
    border-radius: 5px;

    font-size: 20px;
    font-weight: bold;
}
.line.bus {
    border-radius: 100%;
}

.direction {
    flex-grow: 1;
    font-size: 20px;
}
</style>