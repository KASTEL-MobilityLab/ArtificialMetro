import type { Storeable } from "@/model/storeable"
import { normalizeTimestamp } from "@/model/timestamp"
import { type Bike, type CarsharingStation, type Scooter } from "@/model/vehicles"
import { BaseStore } from "@/storage/base_store"
import { BaseRepo } from "@/model/repos"

export async function sync() {
    loadIncrementalData<CarsharingStation>(BaseRepo.CarsharingStations)
    loadIncrementalData<Scooter>(BaseRepo.Scooters)
    loadIncrementalData<Bike>(BaseRepo.Bikes)
}

export async function initial_sync(reportStatus: {(repo: BaseRepo): void}) {
    loadInitialData<CarsharingStation>(BaseRepo.CarsharingStations, reportStatus)
    loadInitialData<Scooter>(BaseRepo.Scooters, reportStatus)
    loadInitialData<Bike>(BaseRepo.Bikes, reportStatus)
}

async function loadInitialData<T extends Storeable>(repo: BaseRepo, reportStatus: {(repo: BaseRepo): void}) {
    const currentDate = normalizeTimestamp(new Date())
    const lastHour = new Date(currentDate.getTime() - 1 * 60 * 60 * 1000 /* 1h */)

    const url = `/v1/${repo}/${lastHour.toISOString()}/${currentDate.toISOString()}`
    const data = await fetchData<T>(url)
    storeData(data, repo)
    reportStatus(repo)
}

async function loadIncrementalData<T extends Storeable>(repo: BaseRepo) {
    const url = `/v1/${repo}/current`
    const data = await fetchData<T>(url)
    storeData(data, repo)
}

async function fetchData<T extends Storeable>(url: string) {
    const result = await fetch(url)
    return await result.json() as T[]
}

async function storeData<T extends Storeable>(data: T[], repo: BaseRepo) {
    const store = await BaseStore.open()
    await store.repo<T>(repo).store(data.map(fixTimestamp))
}

function fixTimestamp<T extends Storeable>(item: T): T {
    item.timestamp = new Date(item.timestamp)
    return item
}