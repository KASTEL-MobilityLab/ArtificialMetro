import * as carsharing from "@/provider/carsharing"
import { DataStore } from "./data_store"
import type { CarsharingStation } from "@/model/vehicles"
import { BaseRepo } from "@/storage/base_store"


async function updateCarsharing() {
    console.log('== Update Carsharing')
    const stations = await carsharing.load()
    DataStore.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
        await c.store(stations)
    })
}

updateCarsharing()
setInterval(updateCarsharing, 5 * 60 * 1000 /* 5min */)