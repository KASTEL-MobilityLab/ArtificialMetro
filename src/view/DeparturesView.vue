<script setup lang="ts">
import { computed, onMounted, ref, type Ref } from 'vue';
import type { SwitchBusReceiver } from './switch_bus';
import type { TramDeparture } from '@/model/vehicles';
import { BaseStore } from '@/storage/base_store';
import { BaseRepo } from '@/model/repos';
import type { CacheRepo } from '@/storage/cache_repo';
import DepartureRow from './DepartureRow.vue'


defineProps<{
    bus: SwitchBusReceiver,
}>()

const timeFormat = Intl.DateTimeFormat("en-US", { hour12: false, hour: '2-digit', minute: '2-digit' })

let currentTimestamp = ref(new Date())
let departures: Ref<TramDeparture[]> = ref([])

let currentTime = computed(() => {
    return timeFormat.format(currentTimestamp.value)
})

onMounted(async () => {
    let store = await BaseStore.open()
    let departuresRepo = store.repo<TramDeparture>(BaseRepo.TramDepartures)

    departuresRepo.onUpdate(updateDepartures)

    updateDepartures(departuresRepo)
})

async function updateDepartures(repo: CacheRepo<TramDeparture, BaseRepo>) {
    const new_departures = await repo.current()
    new_departures.sort(compareDepartures)
    departures.value = new_departures
    updateTimestamp(repo)
}

async function updateTimestamp(repo: CacheRepo<any, any>) {
    let timestamp = await repo.getLatestTimestamp()
    if (timestamp != null) currentTimestamp.value = timestamp
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
    <div class="departure-list">
        <h1>Durlacher Tor / KIT-Campus Süd</h1>
        <DepartureRow v-for="departure in departures" :key="departure.id" :departure="departure"></DepartureRow>
    </div>
    <div class="current-time"><span class="live-dot"></span> {{ currentTime }}</div>
</template>

<style scoped>
.departure-list {
    display: flex;
    flex-direction: column;

    justify-content: flex-start;
    align-items: stretch;

    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;

    background: var(--view-bg-color);
    color: var(--view-fg-color);
}

h1 {
    padding: 20px 40px;
}
</style>