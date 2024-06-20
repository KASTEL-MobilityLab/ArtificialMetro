import * as carsharing from "@/provider/carsharing"
import * as scooter from "@/provider/scooter"
import { DataStore } from "./data_store"
import type { Scooter, CarsharingStation } from "@/model/vehicles"
import { BaseRepo } from "@/storage/base_store"


async function updateCarsharing() {
    console.log('== Update Carsharing')
    const stations = await carsharing.load()
    await DataStore.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
        await c.store(stations)
    })
}

async function updateScooters() {
    console.log("== Update Scooters")
    const scooters = await scooter.load()
    await DataStore.open<Scooter, BaseRepo>(BaseRepo.Scooters, async c => {
        await c.store(scooters)
    })
}

async function updateAll() {
    await updateCarsharing()
    await updateScooters()
}

updateAll()
setInterval(updateAll, 5 * 60 * 1000 /* 5min */)