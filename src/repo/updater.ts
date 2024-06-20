import { DataStore } from "./data_store"
import { BaseRepo } from "@/storage/base_store"
import type { Storeable } from "@/model/storeable"
import type { Provider } from "@/provider/provider"
import { CarsharingProvider } from "@/provider/carsharing"
import { ScooterProvider } from "@/provider/scooter"

async function update(provider: Provider<Storeable>, repo: BaseRepo) {
    console.log("Update")
    const data = await provider.fetch()
    await DataStore.open<Storeable, BaseRepo>(repo, async store => {
        await store.store(data)
    })
}

async function updateAll() {
    await update(new CarsharingProvider(), BaseRepo.CarsharingStations)
    await update(new ScooterProvider(), BaseRepo.Scooters)
}

updateAll()
setInterval(updateAll, 5 * 60 * 1000 /* 5min */)