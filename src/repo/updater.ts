import { DataStore } from "./data_store"
import { BaseRepo } from "@/storage/base_store"
import type { Storeable } from "@/model/storeable"
import type { Provider } from "@/provider/provider"
import { CarsharingProvider } from "@/provider/carsharing"
import { ScooterProvider } from "@/provider/scooter"

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
    }
}

async function updateFromProvider(provider: Provider<Storeable>, repo: BaseRepo) {
    console.log("Update")
    const data = await provider.fetch()
    await DataStore.open<Storeable, BaseRepo>(repo, async store => {
        await store.store(data)
    })
}



updateAll()
setInterval(updateAll, 5 * 60 * 1000 /* 5min */)