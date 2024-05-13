import type { Storeable } from "@/model/storeable";
import { type IDBPDatabase } from "idb";

export class Repo<T extends Storeable> {
    private db: IDBPDatabase<unknown>
    private name: string

    constructor(db: IDBPDatabase<unknown>, name: string) {
        this.db = db
        this.name = name
    }

    async store(stations: T[]) {
        const transaction = this.db.transaction(this.name, 'readwrite')
        const commits = stations.map(station => {
            const key = `${station.id}-${station.timestamp.getTime()}`
            transaction.store.put(station, key)
        })
        await Promise.all([
            ...commits,
            transaction.done,
        ])
    }

    async get(): Promise<T[]> {
        return await this.db.getAll(this.name)
    }

}