import { openDB, type IDBPDatabase } from "idb";
import type { CarsharingStation, Scooter } from "@/model/vehicles";
import { Repo } from "./repo";

const BASE_STORE = "base-store"
export enum BaseRepo {
    CarsharingStations = "carsharing-stations",
    Scooters = "scooters",
}

export class BaseStore {
    private db: IDBPDatabase

    private constructor(db: IDBPDatabase) {
        this.db = db
    }

    static async open(): Promise<BaseStore> {
        const db = await openDB(BASE_STORE, 1, {
            upgrade: (db) => initDatabase(db),
        })
        return new BaseStore(db)
    }

    onUpdate(repo: BaseRepo, func: { (): void }) {
        const channel = new BroadcastChannel(BASE_STORE)
        channel.onmessage = (evt: MessageEvent<BaseRepo>) => {
            const message = evt.data
            if (message == repo) {
                func()
            }
        }
    }

    carsharingStations(): Repo<CarsharingStation, BaseRepo> {
        return new Repo(this.db, BaseRepo.CarsharingStations, BASE_STORE)
    }

    scooters(): Repo<Scooter, BaseRepo> {
        return new Repo(this.db, BaseRepo.Scooters, BASE_STORE)
    }
}

function initDatabase(db: IDBPDatabase<unknown>) {
    createObjectStore(db, BaseRepo.CarsharingStations)
    createObjectStore(db, BaseRepo.Scooters)
}
function createObjectStore(db: IDBPDatabase<unknown>, repo: BaseRepo) {
    const objectStore = db.createObjectStore(repo)
    objectStore.createIndex("timestamp", "timestamp", { unique: false })
}

