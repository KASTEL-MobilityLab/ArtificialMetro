import { DataStore } from "./data_store"
import { BaseRepo } from "@/model/repos"
import type { Storeable } from "@/model/storeable"
import type { Provider } from "@/model/provider"
import registeredProviders from "@/provider/providers"

const UPDATE_INTERVAL = 5 * 60 * 1000 /* 5min */
const CLEANUP_AGE = 48 * 60 * 60 * 1000 /* 48h */

await updateAll()
setInterval(updateAll, UPDATE_INTERVAL)

async function updateAll() {
    for (const provider of registeredProviders) {
        try {
            console.log('Update', provider.name)
            await updateFromProvider(provider.provider, provider.repo)
            await cleanupRepo(provider.repo)
        } catch(ex) {
            console.error("Update failed for", provider.name)
            console.error(ex)
        }
    }
}

async function updateFromProvider(provider: Provider<Storeable>, repo: BaseRepo) {
    const data = await provider.fetch()
    await DataStore.open<Storeable, BaseRepo>(repo, async store => {
        await store.store(data)
    })
}

async function cleanupRepo(repo: BaseRepo) {
    console.log('Cleanup repo', repo)
    const now = new Date()
    const oldestTimestamp = new Date(now.getTime() - CLEANUP_AGE)
    await DataStore.open<Storeable, BaseRepo>(repo, async store => {
        console.log('Cleanup since', oldestTimestamp)
        await store.cleanupSince(oldestTimestamp)
    })
}