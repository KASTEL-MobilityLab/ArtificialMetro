import type { CarsharingStation } from "@/model/vehicles";
import type { Express } from "express";
import { Level } from "level";

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
        const db = new Level<string, CarsharingStation>('data/base_store', {valueEncoding: 'json'})
        const now = new Date()
        const sub = db.sublevel<string, CarsharingStation>(now.toISOString(), {valueEncoding: 'json'})
        await sub.put('001', {
            id: "001",
            available: 1,
            timestamp: new Date(),
            position: {lat: 0, lon: 0},
        })
        await sub.put('002', {
            id: "002",
            available: 3,
            timestamp: new Date(),
            position: {lat: 2, lon: 2},
        })
        res.send("Ok")
    })
    app.get('/v1/get', async (_, res) => {
        const db = new Level<string, CarsharingStation>('data/base_store', {valueEncoding: 'json'})
        const sub = db.sublevel<string, CarsharingStation>('2024-06-18T18:34:26.352Z', {valueEncoding: 'json'})
        const data: {key: string, value: CarsharingStation}[] = []
        for await (const [key, value] of sub.iterator()) {
            data.push({key, value})
        }
        res.type('json')
        res.send(JSON.stringify(data))
    })
}