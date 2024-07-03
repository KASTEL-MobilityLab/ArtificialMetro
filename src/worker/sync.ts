import { type Bike, type CarsharingStation, type Scooter } from "@/model/vehicles"
import { BaseRepo } from "@/model/repos"
import { SyncRepo } from "./sync_repo"

const repos = [
    new SyncRepo<CarsharingStation>(BaseRepo.CarsharingStations),
    new SyncRepo<Scooter>(BaseRepo.Scooters),
    new SyncRepo<Bike>(BaseRepo.Bikes),
]

export async function sync() {
    const promises = repos.map(repo => repo.loadIncrementalData())
    await Promise.all(promises)
}

export async function initial_sync(reportStatus: { (repo: BaseRepo): void }) {
    const promises = repos.map(repo => {
        repo.onLoaded(reportStatus)
        return repo.loadInitialData()
    })
    await Promise.all(promises)
}