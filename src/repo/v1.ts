import { type CarsharingStation } from "@/model/vehicles"
import type { Express } from "express"
import { Container } from "./container"
import { BaseRepo } from "@/storage/base_store"
import * as carsharing from "@/provider/carsharing"

export function use(app: Express) {
    app.get('/v1/sample', (_, res) => {

        const sample: CarsharingStation[] = [
            {
                id: "001",
                available: 1,
                timestamp: new Date(),
                position: {lat: 0, lon: 0},
            },
        ]
    
        res.type('json')
        res.send(JSON.stringify(sample))
    })
    app.get('/v1/init', async (_, res) => {

        Container.open<CarsharingStation,BaseRepo>(BaseRepo.CarsharingStations, async c => {
            await c.store([
                {
                    id: "001",
                    available: 1,
                    timestamp: new Date(),
                    position: {lat: 0, lon: 0},
                },
                {
                    id: "002",
                    available: 3,
                    timestamp: new Date(),
                    position: {lat: 2, lon: 2},
                }
            ])
        })
        res.send("Ok")
    })
    app.get('/v1/get', async (_, res) => {
        Container.open<CarsharingStation,BaseRepo>(BaseRepo.CarsharingStations, async c => {
            const timestamps = await c.getAvailableTimestamps()
            res.type('json')
            res.send(JSON.stringify(timestamps))
        })
    })
    app.get('/v1/current', async (_, res) => {
        Container.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
            const items = await c.current()
            res.type('json')
            res.send(JSON.stringify(items))
        })
    })

    app.get('/v1/all', async (_, res) => {
        Container.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
            const items = await c.all()
            res.type('json')
            res.send(JSON.stringify(items))
        })
    })

    app.get('/v1/update', async (_, res) => {
        const stations = await carsharing.load()
        Container.open<CarsharingStation, BaseRepo>(BaseRepo.CarsharingStations, async c => {
            await c.store(stations)

            res.type('json')
            res.send(JSON.stringify(true))
        })
    })
}