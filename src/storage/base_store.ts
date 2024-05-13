import { openDB, type IDBPDatabase } from "idb";
import { Repo } from "./repo";
import type { Storeable } from "@/model/storeable";

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

    repo<T extends Storeable>(repo: BaseRepo): Repo<T, BaseRepo> {
        return new Repo(this.db, repo, BASE_STORE)
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

