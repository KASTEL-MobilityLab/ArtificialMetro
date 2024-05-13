import type { CarsharingStation } from "@/model/vehicles";
import { openDB, type IDBPDatabase } from "idb";

export class CarsharingRepo {
    private db: IDBPDatabase<unknown>;
    private constructor(db: IDBPDatabase<unknown>) {
        this.db = db
    }

    static async new(): Promise<CarsharingRepo> {
        const database = await openDB('base-data', 1, {
            upgrade(database) {
                database.createObjectStore('carsharing-stations')
            },
        })
        return new CarsharingRepo(database)
    }

    async storeStations(stations: CarsharingStation[]) {
        const transaction = this.db.transaction('carsharing-stations', 'readwrite')
        const commits = stations.map(station => {
            transaction.store.put(station, `${station.stationId}-${station.timestamp}`)
        })
        await Promise.all([
            ...commits,
            transaction.done,
        ])
    }

    async getStations(): Promise<CarsharingStation[]> {
        return await this.db.getAll('carsharing-stations')
    }

}