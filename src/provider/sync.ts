import type { Storeable } from "@/model/storeable"
import { normalizeTimestamp } from "@/model/timestamp"
import type { CarsharingStation, Scooter } from "@/model/vehicles"
import { BaseRepo, BaseStore } from "@/storage/base_store"

export async function sync() {

}

export async function initial_sync() {
    loadInitialData<CarsharingStation>(BaseRepo.CarsharingStations)
    loadInitialData<Scooter>(BaseRepo.Scooters)
}

async function loadInitialData<T extends Storeable>(repo: BaseRepo) {
    const currentDate = normalizeTimestamp(new Date())
    const lastHour = new Date(currentDate.getTime() - 1 * 60 * 60 * 1000 /* 1h */)

    const url = `/v1/${repo}/${lastHour.toISOString()}/${currentDate.toISOString()}`
    const result = await fetch(url)
    const json = await result.json() as T[]
    storeData(json, repo)
}

async function storeData<T extends Storeable>(data: T[], repo: BaseRepo) {
    const store = await BaseStore.open()
    await store.repo<T>(repo).store(data.map(fixTimestamp))
}

function fixTimestamp<T extends Storeable>(item: T): T {
    item.timestamp = new Date(item.timestamp)
    return item
}