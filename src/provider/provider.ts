import type { Storeable } from "@/model/storeable"
import * as sync from "./sync"

export interface Provider<T extends Storeable> {
    attribution(): string
    fetch(): Promise<T[]>
}

export function startAll() {
    // startCarsharingProvider()
    // startScooterProvider()
    // startCleanupProvider()
    // startSyncProvider()
    sync.initial_sync()
}

export function startCarsharingProvider() {
    return new Worker(new URL("./carsharing_worker.ts", import.meta.url), { type: "module" })
}

export function startScooterProvider() {
    return new SharedWorker(new URL("./scooter_worker.ts", import.meta.url), { type: "module" })
}

export function startCleanupProvider() {
    return new SharedWorker(new URL("./cleanup_worker.ts", import.meta.url), { type: "module" })
}

export function startSyncProvider() {
    return new SharedWorker(new URL("./sync_worker.ts", import.meta.url), { type: "module" })
}

