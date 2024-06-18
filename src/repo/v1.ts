import type { CarsharingStation } from "@/model/vehicles";
import type { Express } from "express";
import { Level } from "level";
import { Container } from "./container";
import { BaseRepo } from "../storage/base_store";

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
}