import type { Scooter, CarsharingStation } from "@/model/vehicles"
import type { Express } from "express"
import { DataStore } from "./data_store"
import { BaseRepo } from "@/storage/base_store"
import {repoAccess} from "./v1/repo_access"

export function use(app: Express) {
    app.use('/v1/carsharing_stations', repoAccess<CarsharingStation>(BaseRepo.CarsharingStations))
    app.use('/v1/scooters', repoAccess<Scooter>(BaseRepo.Scooters))

    app.get('/v1/sample', (_, res) => {

        const sample: CarsharingStation[] = [
            {
                id: "001",
                available: 1,
                timestamp: new Date(),
                position: { lat: 0, lon: 0 },
            },
        ]

        res.type('json')
        res.send(JSON.stringify(sample))
    })
    app.get('/v1/init', async (_, res) => {

        DataStore.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
            await c.store([
                {
                    id: "001",
                    available: 1,
                    timestamp: new Date(),
                    position: { lat: 0, lon: 0 },
                },
                {
                    id: "002",
                    available: 3,
                    timestamp: new Date(),
                    position: { lat: 2, lon: 2 },
                }
            ])
        })
        res.send("Ok")
    })
    app.get('/v1/get', async (_, res) => {
        DataStore.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
            const timestamps = await c.getAvailableTimestamps()
            res.type('json')
            res.send(JSON.stringify(timestamps))
        })
    })
    app.get('/v1/current', async (_, res) => {
        DataStore.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
            const items = await c.current()
            res.type('json')
            res.send(JSON.stringify(items))
        })
    })
    app.get('/v1/scooters', async (_, res) => {
        DataStore.open<Scooter, BaseRepo>(BaseRepo.Scooters, async c => {
            const items = await c.current()
            res.type('json')
            res.send(JSON.stringify(items))
        })
    })

    app.get('/v1/all', async (_, res) => {
        DataStore.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
            const items = await c.all()
            res.type('json')
            res.send(JSON.stringify(items))
        })
    })
}