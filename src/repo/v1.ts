import type { CarsharingStation } from "@/model/vehicles";
import type { Express } from "express";

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
}