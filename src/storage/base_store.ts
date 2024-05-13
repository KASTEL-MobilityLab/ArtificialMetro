import { openDB, type IDBPDatabase } from "idb";
import type { CarsharingStation } from "@/model/vehicles";
import { Repo } from "./repo";

const BASE_STORE = "base-store"
const CARSHARING_STATIONS = "carsharing-stations"

export class BaseStore {
    private db: IDBPDatabase

    private constructor(db: IDBPDatabase) {
        this.db = db
    }

    static async open(): Promise<BaseStore> {
        const db = await openDB(BASE_STORE, 1, {
            upgrade(db) {
                const carsharing = db.createObjectStore(CARSHARING_STATIONS)
                carsharing.createIndex("timestamp", "timestamp", { unique: false })
            },
        })
        return new BaseStore(db)
    }

    carsharingStations(): Repo<CarsharingStation> {
        return new Repo(this.db, CARSHARING_STATIONS)
    }
}