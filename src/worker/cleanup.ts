import { type CarsharingStation, type Scooter } from "@/model/vehicles";
import { BaseRepo, BaseStore } from "@/storage/base_store";

const CLEANUP_THRESHOLD = 1 * 60 * 60 * 1000 /* 1h */
const store = await BaseStore.open()

export function cleanup() {
    const time = thresholdTime()
    store.repo<Scooter>(BaseRepo.Scooters).cleanupSince(time)
    store.repo<CarsharingStation>(BaseRepo.CarsharingStations).cleanupSince(time)
}

function thresholdTime() {
    return new Date((new Date()).getTime() - CLEANUP_THRESHOLD);
}
