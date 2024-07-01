<script setup lang="ts">
import { onMounted, ref } from 'vue'
import * as workers from '@/worker/workers'
import { BaseRepo } from '@/model/repos';


const carsharingLoaded = ref(false)
const scootersLoaded = ref(false)
const bikesLoaded = ref(false)

onMounted(() => {
    workers.startCleanupWorker()
    const syncWorker = workers.startSyncWorker()
    syncWorker.port.onmessage = (event: MessageEvent<BaseRepo>) => {
        const repo = event.data
        repoLoaded(repo)
    }
})

function repoLoaded(repo: BaseRepo) {
    switch (repo) {
        case BaseRepo.CarsharingStations:
            carsharingLoaded.value = true
            break
        case BaseRepo.Scooters:
            scootersLoaded.value = true
            break
        case BaseRepo.Bikes:
            bikesLoaded.value = true
            break
    }
}

</script>

<template>
    <div class="startup-view">
        <div class="vehicles">
            <img src="/brands/stadtmobil_karlsruhe.svg" :class="{ disabled: !carsharingLoaded }" />
            <img src="/brands/nextbike.svg" :class="{ disabled: !bikesLoaded }" />
            <img src="/brands/scooter_bolt.svg" :class="{ disabled: !scootersLoaded }" />
            <img src="/brands/train-db.svg" class="disabled" />
            <img src="/brands/bus-kvv.svg" class="disabled" />
        </div>
    </div>
</template>

<style scoped>
.startup-view {
    display: flex;
    position: absolute;

    flex-direction: column;
    justify-content: center;
    align-items: center;

    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    background: var(--view-bg-color);
}

.vehicles {
    display: flex;
    flex-direction: row;
    gap: 20px;
}

.vehicles img {
    width: 50px;
    transition: 0.5s ease-in-out;
}

.vehicles .disabled {
    filter: saturate(0);
}
</style>