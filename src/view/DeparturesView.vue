<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue';
import type { SwitchBusReceiver } from './switch_bus';
import type { TramDeparture } from '@/model/vehicles';
import { BaseStore } from '@/storage/base_store';
import { BaseRepo } from '@/model/repos';
import type { CacheRepo } from '@/storage/cache_repo';
import DepartureRow from './DepartureRow.vue'


const props = defineProps<{
    bus: SwitchBusReceiver,
    station: string,
    title: string,
}>()

let currentSystemTime = ref(new Date())
let departures: Ref<TramDeparture[]> = ref([])
let filteredDepartures = computed(() => {
    const time = currentSystemTime.value
    return departures.value.filter(departure => {
        return (new Date(departure.realtime)).getTime() >= time.getTime()
    })
})


onMounted(async () => {
    let store = await BaseStore.open()
    let departuresRepo = store.repo<TramDeparture>(BaseRepo.TramDepartures)

    departuresRepo.onUpdate(updateDepartures)

    updateDepartures(departuresRepo)

    setInterval(updateSystemTime, 30 * 1000 /*30s*/)
})

async function updateDepartures(repo: CacheRepo<TramDeparture, BaseRepo>) {
    const new_departures = await repo.current()
    const station_departures = new_departures.filter(departure => departure.station == props.station)
    station_departures.sort(compareDepartures)
    departures.value = station_departures
}

function updateSystemTime() {
    currentSystemTime.value = new Date()
}

function compareDepartures(a: TramDeparture, b: TramDeparture): number {
    if (a.realtime == b.realtime) {
        return 0
    } else if (a.realtime < b.realtime) {
        return -1
    } else {
        return 1
    }
}

</script>

<template>
    <div class="departures-view">
        <TransitionGroup class="departure-list" tag="div" name="departures">
            <h1 key="header">{{ title }}</h1>
            <DepartureRow v-for="departure in filteredDepartures" :key="departure.id" :departure="departure"></DepartureRow>
        </TransitionGroup>
        <div class="fade-out"></div>
    </div>
</template>

<style scoped>
.departures-view {
    display: block;

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    background: var(--view-bg-color);
    color: var(--view-fg-color);
}
.departure-list {
    display: flex;
    flex-direction: column;

    justify-content: flex-start;
    align-items: stretch;
}

h1 {
    padding: 20px 40px;
}

.departures-move,
.departures-enter-active,
.departures-leave-active {
    transition: 0.5s ease-in-out;
}
.departures-enter-from{
    opacity: 0;
    transform: translateY(30px);
}
.departures-leave-to {
    opacity: 0;
    transform: translateY(-30px);
}
.departures-leave-active {
    position: absolute;
}

.fade-out {
    display: block;
    position: absolute;

    left: 0;
    right: 0;
    bottom: 0;
    height: 200px;

    background: linear-gradient(to bottom, transparent, var(--view-bg-color));
}
</style>