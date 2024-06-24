import { DataStore } from "./data_store"
import { BaseRepo } from "@/model/repos"
import type { Storeable } from "@/model/storeable"
import type { Provider } from "@/model/provider"
import { CarsharingProvider } from "@/provider/carsharing"
import { ScooterProvider } from "@/provider/scooter"

const UPDATE_INTERVAL = 5 * 60 * 1000 /* 5min */
const CLEANUP_AGE = 48 * 60 * 60 *60 * 1000 /* 28h */

const providers: {
    repo: BaseRepo,
    provider: Provider<Storeable>
}[] = [
        {
            repo: BaseRepo.CarsharingStations,
            provider: new CarsharingProvider(),
        }, {
            repo: BaseRepo.Scooters,
            provider: new ScooterProvider(),
        }
    ]


async function updateAll() {
    for (const provider of providers) {
        await updateFromProvider(provider.provider, provider.repo)
        await cleanupRepo(provider.repo)
    }
}

async function updateFromProvider(provider: Provider<Storeable>, repo: BaseRepo) {
    const data = await provider.fetch()
    await DataStore.open<Storeable, BaseRepo>(repo, async store => {
        await store.store(data)
    })
}

async function cleanupRepo(repo: BaseRepo) {
    const now = new Date()
    const oldestTimestamp = new Date(now.getTime() - CLEANUP_AGE)
    await DataStore.open<Storeable, BaseRepo>(repo, async store => {
        await store.cleanupSince(oldestTimestamp)
    })
}


updateAll()
setInterval(updateAll, UPDATE_INTERVAL)