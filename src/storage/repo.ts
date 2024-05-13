import type { Storeable } from "@/model/storeable";
import { type IDBPDatabase } from "idb";

export class Repo<T extends Storeable, R extends string> {
    private db: IDBPDatabase<unknown>
    private channel: BroadcastChannel
    private name: R

    constructor(db: IDBPDatabase<unknown>, name: R, channel_name: string) {
        this.db = db
        this.name = name
        this.channel = new BroadcastChannel(channel_name)
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
        this.channel.postMessage(this.name)
    }

    async get(): Promise<T[]> {
        return await this.db.getAll(this.name)
    }

}