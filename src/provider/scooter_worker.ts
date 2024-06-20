import type { Scooter } from "@/model/vehicles"
import * as scooter from "./scooter"
import { BaseRepo, BaseStore } from "@/storage/base_store"

const store = await BaseStore.open()

globalThis.setInterval(() => {
    update()
}, 5 * 60 * 1000)

update()

async function update() {
    const scooters = await scooter.load()
    store.repo<Scooter>(BaseRepo.Scooters).store(scooters)
}