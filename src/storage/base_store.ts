import { openDB, type IDBPDatabase } from "idb";
import { CacheRepo } from "./cache_repo";
import type { Storeable } from "@/model/storeable";
import { BaseRepo } from "../model/repos";

const BASE_STORE = "base-store"
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

    repo<T extends Storeable>(repo: BaseRepo): CacheRepo<T, BaseRepo> {
        return new CacheRepo(this.db, repo, BASE_STORE)
    }
}

function initDatabase(db: IDBPDatabase<unknown>) {
    createObjectStore(db, BaseRepo.CarsharingStations)
    createObjectStore(db, BaseRepo.Scooters)
    createObjectStore(db, BaseRepo.Bikes)
}
function createObjectStore(db: IDBPDatabase<unknown>, repo: BaseRepo) {
    const objectStore = db.createObjectStore(repo)
    objectStore.createIndex("timestamp", "timestamp", { unique: false })
}

