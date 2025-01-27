import type { Storeable } from "@/model/storeable";
import { normalizeTimestamp } from "@/model/timestamp";
import { type IDBPDatabase } from "idb";

export class CacheRepo<T extends Storeable, R extends string> {
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

    kind(): R {
        return this.name
    }

    onUpdate(func: { (repo: CacheRepo<T, R>): void }) {
        const channel = new BroadcastChannel(this.channel_name)
        channel.onmessage = (evt: MessageEvent<R>) => {
            const message = evt.data
            if (message == this.name) {
                func(this)
            }
        }
    }

    async store(entries: T[]) {
        const transaction = this.db.transaction(this.name, 'readwrite')
        const commits = entries.map(entity => {
            entity.timestamp = normalizeTimestamp(entity.timestamp)
            const key = `${entity.id}-${entity.timestamp.getTime()}`
            transaction.store.put(entity, key)
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

    async isEmpty(): Promise<boolean> {
        return (await this.db.count(this.name)) == 0
    }

    async current(): Promise<T[]> {
        const currentTimestamp = await this.getLatestTimestamp()
        if (currentTimestamp == null) {
            return []
        } else {
            return await this.db.getAllFromIndex(this.name, "timestamp", IDBKeyRange.only(currentTimestamp))
        }
    }

    async forTimestamp(timestamp: Date): Promise<T[]> {
        return await this.db.getAllFromIndex(this.name, "timestamp", IDBKeyRange.only(timestamp))
    }

    async getLatestTimestamp(): Promise<Date | null> {
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

    async getAvailableTimestamps(): Promise<Date[]> {
        const tx = this.db.transaction(this.name, 'readonly')
        const timestamps = []
        // reverse-sort on the timestamp index. 
        // only return unique timestamps
        const index = tx.store.index("timestamp")
        const cursor = index.iterate(null, 'prevunique')
        for await (const item of cursor) {
            const timestamp = item.value.timestamp as Date
            timestamps.push(timestamp)
        }
        await tx.done

        return timestamps
    }

    async cleanupSince(time: Date) {
        const tx = this.db.transaction(this.name, 'readwrite')
        const index = tx.store.index("timestamp")
        const cursor = index.iterate(IDBKeyRange.upperBound(time))
        for await (const item of cursor) {
            item.delete()
        }
        await tx.done
    }

}