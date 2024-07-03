import type { BaseRepo } from "@/model/repos"
import type { Storeable } from "@/model/storeable"
import { normalizeTimestamp } from "@/model/timestamp"
import { BaseStore } from "@/storage/base_store"

type LoadedHandler = (repo: BaseRepo) => void

export class SyncRepo<T extends Storeable> {
    private repo: BaseRepo
    private etag: string | null = null
    private loadedHandler: LoadedHandler = () => { }

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
        await storeData(data, this.repo)
        this.loadedHandler(this.repo)
        this.etag = etag
    }

    async loadIncrementalData() {
        const url = `/v1/${this.repo}/current`
        const { data, etag } = await fetchData<T>(url)
        await storeData(data, this.repo)
        this.etag = etag
    }
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