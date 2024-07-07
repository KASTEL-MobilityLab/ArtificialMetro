import type { Storeable } from "@/model/storeable";
import { Level } from "level";
import { normalizeTimestamp } from "@/model/timestamp";

type Timestamp = string

export class DataStore<T extends Storeable, R extends string> {
    private database: Level<string, T>
    private index: Index<Timestamp>

    private constructor(store: R) {
        this.database = new Level(`data/${store}`, { valueEncoding: 'json' })
        this.index = new Index(this.database, 'timestamp')
    }

    close() {
        this.database.close()
    }

    static async open<T extends Storeable, R extends string>(store: R, callback: (self: DataStore<T, R>) => Promise<void>) {
        const container = new DataStore<T, R>(store)
        await callback(container)
        container.close()
    }

    private getPartition(timestamp: Timestamp | Date): Level<Timestamp, T> {
        const partition = typeof timestamp == 'string' ? timestamp : timestamp.toISOString()
        return this.database.sublevel<string, T>(partition, { valueEncoding: 'json' }) as any as Level<Timestamp, T>
    }

    async store(entries: T[]) {
        await this.database.open()
        const entryGroups = groupByTimestamp(entries)
        for (const timestamp in entryGroups) {
            const group = entryGroups[timestamp]
            await this.storeGroup(timestamp, group)
        }
    }

    private async storeGroup(timestamp: Timestamp, group: T[]) {
        const db = this.getPartition(timestamp)
        const transactions = group.map(item => {
            db.put(item.id, item)
        })
        await this.index.put(timestamp)
        await Promise.all(transactions)
    }

    private async loadData(partition: Level<Timestamp, T>): Promise<T[]> {
        const data: T[] = []
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const [_, item] of partition.iterator()) {
            // ignore index entries
            if (typeof item != 'boolean') data.push(item)
        }
        return data
    }

    async forTimestamp(time: Date): Promise<T[]> {
        await this.database.open()
        const normalizedTime = normalizeTimestamp(time).toISOString()
        const db = this.getPartition(normalizedTime)
        return this.loadData(db)
    }

    async getAvailableTimestamps(): Promise<Date[]> {
        await this.database.open()
        const timestamps = await this.index.list()
        return timestamps.map(timestamp => new Date(timestamp))
    }

    async getLatestTimestamp(): Promise<Date | null> {
        await this.database.open()
        const timestamps = await this.getAvailableTimestamps()
        if (timestamps.length == 0) return null

        timestamps.sort()
        timestamps.reverse()
        return timestamps[0]
    }

    async all(): Promise<T[]> {
        await this.database.open()
        return this.loadData(this.database)
    }

    async current(): Promise<T[]> {
        const timestamp = await this.getLatestTimestamp()
        if (timestamp == null) return []
        const partition = this.getPartition(timestamp)
        return this.loadData(partition)
    }

    async cleanupSince(time: Date) {
        await this.database.open()
        const timestamps = await this.getAvailableTimestamps()
        const relevantTimestamps = timestamps.filter(t => t < time)
        for (const timestamp of relevantTimestamps) {
            await this.cleanPartition(timestamp)
        }
    }

    private async cleanPartition(timestamp: Date) {
        console.log('Clean Partition', timestamp)
        const partition = this.getPartition(timestamp)
        await partition.clear()
        await this.index.drop(timestamp.toISOString())
    }
}

class Index<T> {
    private database: Level<T, boolean>
    constructor(db: Level<string, any>, name: string) {
        this.database = db.sublevel(name) as any as Level<T, boolean>
    }

    async put(value: T) {
        await this.database.put(value, true)
    }

    async has(value: T): Promise<boolean> {
        const iter = this.database.iterator();
        for await (const [key, valid] of iter) {
            if (key == value && valid) {
                iter.close()
                return true
            }
        }
        return false
    }

    async list(): Promise<T[]> {
        const keys: T[] = []
        for await (const [key, valid] of this.database.iterator()) {
            if (valid) keys.push(key)
        }
        return keys
    }

    async drop(value: T) {
        await this.database.del(value)
    }

}

function groupByTimestamp<T extends Storeable>(items: T[]): { [keys: Timestamp]: T[] } {
    const groups: { [keys: Timestamp]: T[] } = {}

    items.forEach(item => {
        const timestamp = normalizeTimestamp(item.timestamp).toISOString()
        if (timestamp in groups) {
            groups[timestamp].push(item)
        } else {
            groups[timestamp] = [item]
        }
    })
    return groups
}