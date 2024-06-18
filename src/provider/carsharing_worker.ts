import { BaseRepo, BaseStore } from "@/storage/base_store"
import * as carsharing from "./carsharing"
import type { CarsharingStation } from "@/model/vehicles"

const store = await BaseStore.open()

globalThis.setInterval(() => {
    update()
}, 5 * 60 * 1000)

update()

async function update() {
    const stations = await carsharing.load()
    store.repo<CarsharingStation>(BaseRepo.CarsharingStations).store(stations)
}