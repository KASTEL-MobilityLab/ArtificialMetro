import type { Storeable } from "@/model/storeable"
import { normalizeTimestamp } from "@/model/timestamp"
import { type Bike, type CarsharingStation, type Scooter } from "@/model/vehicles"
import { BaseStore } from "@/storage/base_store"
import { BaseRepo } from "@/model/repos"

type LoadedHandler = (repo: BaseRepo) => void

class SyncRepo<T extends Storeable> {
    private repo: BaseRepo
    private etag: string|null = null
    private loadedHandler: LoadedHandler = () => {}

    constructor(repo: BaseRepo) {
        this.repo = repo
    }

    onLoaded(handler: LoadedHandler) {
        this.loadedHandler = handler
    }

    async loadInitialData() {
        const currentDate = normalizeTimestamp(new Date())
        const lastHour = new Date(currentDate.getTime() - 1 * 60 * 60 * 1000 /* 1h */)

        const url = `/v1/${this.repo}/${lastHour.toISOString()}/${currentDate.toISOString()}`
        const { data, etag } = await fetchData<T>(url)
        storeData(data, this.repo)
        this.loadedHandler(this.repo)
        this.etag = etag
    }

    async loadIncrementalData() {
        const url = `/v1/${this.repo}/current`
        const { data, etag } = await fetchData<T>(url)
        storeData(data, this.repo)
        this.etag = etag
    }
}

export async function sync() {
    const carsharing = new SyncRepo<CarsharingStation>(BaseRepo.CarsharingStations)
    carsharing.loadIncrementalData()

    const scooters = new SyncRepo<Scooter>(BaseRepo.Scooters)
    scooters.loadIncrementalData()

    const bikes = new SyncRepo<Bike>(BaseRepo.Bikes)
    bikes.loadIncrementalData()
}

export async function initial_sync(reportStatus: { (repo: BaseRepo): void }) {
    const carsharing = new SyncRepo<CarsharingStation>(BaseRepo.CarsharingStations)
    carsharing.onLoaded(reportStatus)
    carsharing.loadInitialData()

    const scooters = new SyncRepo<Scooter>(BaseRepo.Scooters)
    scooters.onLoaded(reportStatus)
    scooters.loadInitialData()

    const bikes = new SyncRepo<Bike>(BaseRepo.Bikes)
    bikes.onLoaded(reportStatus)
    bikes.loadInitialData()
}

async function fetchData<T extends Storeable>(url: string): Promise<{ data: T[], etag: string | null }> {
    const result = await fetch(url)
    const etag = result.headers.get('Etag')
    return { data: await result.json() as T[], etag }
}

async function storeData<T extends Storeable>(data: T[], repo: BaseRepo) {
    const store = await BaseStore.open()
    await store.repo<T>(repo).store(data.map(fixTimestamp))
}

function fixTimestamp<T extends Storeable>(item: T): T {
    item.timestamp = new Date(item.timestamp)
    return item
}