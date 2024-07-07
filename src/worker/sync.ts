import { BaseRepo } from "@/model/repos"
import { SyncRepo } from "./sync_repo"
import type { Storeable } from "@/model/storeable"

const syncRepos = Object.keys(BaseRepo)
    .map(repo => new SyncRepo<Storeable>(repo as BaseRepo))

export async function initial_sync(reportStatus: { (repo: BaseRepo): void }) {
    const promises = syncRepos.map(repo => {
        repo.onLoaded(reportStatus)
        return repo.loadInitialData()
    })
    await Promise.all(promises)
}

export async function incremental_sync() {
    const promises = syncRepos.map(repo => repo.loadIncrementalData())
    await Promise.all(promises)
}