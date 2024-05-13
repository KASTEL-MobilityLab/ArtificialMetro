import type { Storeable } from "@/model/storeable";
import { type IDBPDatabase } from "idb";

export class Repo<T extends Storeable, R extends string> {
    private db: IDBPDatabase<unknown>
    private channel: BroadcastChannel
    private channel_name: string
    private name: R

    constructor(db: IDBPDatabase<unknown>, name: R, channel_name: string) {
        this.db = db
        this.name = name
        this.channel = new BroadcastChannel(channel_name)
        this.channel_name = channel_name
    }

    onUpdate(func: { (repo: Repo<T, R>): void }) {
        const channel = new BroadcastChannel(this.channel_name)
        channel.onmessage = (evt: MessageEvent<R>) => {
            const message = evt.data
            if (message == this.name) {
                func(this)
            }
        }
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

    async all(): Promise<T[]> {
        return await this.db.getAll(this.name)
    }

    async current(): Promise<T[]> {
        const currentTimestamp = await this.getMaxDate()
        if (currentTimestamp == null) {
            return []
        } else {
            return await this.db.getAllFromIndex(this.name, "timestamp", IDBKeyRange.only(currentTimestamp))
        }
    }

    async getMaxDate(): Promise<Date | null> {
        const tx = this.db.transaction(this.name, 'readonly')
        // reverse-sort on the timestamp index. 
        // The first item is the current timestamp
        const index = tx.store.index("timestamp")
        const cursor = index.iterate(null, 'prevunique')
        for await (const item of cursor) {
            const timestamp = item.value.timestamp as Date
            return timestamp
        }
        // make sure the transaction is done
        await tx.done
        return null
    }

}