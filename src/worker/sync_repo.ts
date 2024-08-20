import type { BaseRepo } from "@/model/repos"
import type { Storeable } from "@/model/storeable"
import { normalizeTimestamp } from "@/model/timestamp"
import { BaseStore } from "@/storage/base_store"

const CACHE_PERIOD = 3 * 60 * 60 * 1000 /* 3h */

type LoadedHandler = (repo: BaseRepo) => void
type Etag = string | null

export class SyncRepo<T extends Storeable> {
    private repo: BaseRepo
    private etag: Etag = null
    private loadedHandler: LoadedHandler = () => { }

    constructor(repo: BaseRepo) {
        this.repo = repo
    }

    onLoaded(handler: LoadedHandler) {
        this.loadedHandler = handler
    }

    async loadInitialData() {
        const currentDate = normalizeTimestamp(new Date())
        const oldestHour = new Date(currentDate.getTime() - CACHE_PERIOD)

        const url = `/v1/${this.repo}/${oldestHour.toISOString()}/${currentDate.toISOString()}`
        const { data, etag } = await fetchData<T>(url, this.etag)
        await storeData(data, this.repo)
        this.loadedHandler(this.repo)
        this.etag = etag
    }

    async loadIncrementalData() {
        const url = `/v1/${this.repo}/current`
        const { data, etag } = await fetchData<T>(url, this.etag)
        await storeData(data, this.repo)
        this.etag = etag
    }
}

async function fetchData<T extends Storeable>(url: string, etag: Etag): Promise<{ data: T[], etag: Etag }> {
    const headers = {} as any
    if (etag != null) {
        headers["If-None-Match"] = etag
    }
    const result = await fetch(url, { headers })
    const resultEtag = result.headers.get('Etag')
    const resultStatus = result.status
    if (resultStatus == 304) {
        return { data: [], etag: resultEtag }
    } else {
        return {
            data: await result.json() as T[],
            etag: resultEtag
        }
    }
}

async function storeData<T extends Storeable>(data: T[], repo: BaseRepo) {
    const store = await BaseStore.open()
    await store.repo<T>(repo).store(data.map(fixTimestamp))
}

function fixTimestamp<T extends Storeable>(item: T): T {
    item.timestamp = new Date(item.timestamp)
    return item
}