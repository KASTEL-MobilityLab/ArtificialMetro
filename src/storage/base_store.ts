import { openDB, type IDBPDatabase } from "idb";
import type { CarsharingStation } from "@/model/vehicles";
import { Repo } from "./repo";

const BASE_STORE = "base-store"
export enum BaseRepos {
    CarsharingStations = "carsharing-stations",
}

export class BaseStore {
    private db: IDBPDatabase

    private constructor(db: IDBPDatabase) {
        this.db = db
    }

    static async open(): Promise<BaseStore> {
        const db = await openDB(BASE_STORE, 1, {
            upgrade(db) {
                const carsharing = db.createObjectStore(BaseRepos.CarsharingStations)
                carsharing.createIndex("timestamp", "timestamp", { unique: false })
            },
        })
        return new BaseStore(db)
    }

    onUpdate(repo: BaseRepos, func: {(): void}) {
        const channel = new BroadcastChannel(BASE_STORE)
        channel.onmessage = (evt: MessageEvent<BaseRepos>) => {
            const message = evt.data
            if (message == repo) {
                func()
            }
        }
    }

    carsharingStations(): Repo<CarsharingStation, BaseRepos> {
        return new Repo(this.db, BaseRepos.CarsharingStations, BASE_STORE)
    }
}