import type { Storeable } from "@/model/storeable";
import { Level } from "level";
import { normalizeTimestamp } from "./timestamp";

type Timestamp = string

export class Container<T extends Storeable, R extends string> {
    private database: Level<string, T>
    private index: Index<Timestamp>

    private constructor(store: R) {
        this.database = new Level(`data/${store}`, { valueEncoding: 'json' })
        this.index = new Index(this.database, 'timestamp')
    }

    close() {
        this.database.close()
    }

    static async open<T extends Storeable, R extends string>(store: R, callback: (self: Container<T, R>) => Promise<void>) {
        const container = new Container<T, R>(store)
        await callback(container)
        container.close()
    }

    private partition(timestamp: Timestamp) {
        return this.database.sublevel<string, T>(timestamp, { valueEncoding: 'json' })
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
        const db = this.partition(timestamp)
        const transactions = group.map(item => {
            db.put(item.id, item)
        })
        await this.index.put(timestamp)
        await Promise.all(transactions)
    }

    async forTimestamp(time: Date): Promise<T[]> {
        await this.database.open()
        const normalizedTime = normalizeTimestamp(time).toISOString()
        const db = this.partition(normalizedTime)
        const data: T[] = []
        for await (const [_, item] of db.iterator()) {
            data.push(item)
        }
        return data
    }

    async getAvailableTimestamps(): Promise<Date[]> {
        await this.database.open()
        const timestamps = await this.index.list()
        return timestamps.map(timestamp => new Date(timestamp))
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