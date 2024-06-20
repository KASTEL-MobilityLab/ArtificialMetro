import type { Storeable } from "@/model/storeable"

export interface Provider<T extends Storeable> {
    attribution(): string
    fetch(): Promise<T[]>
}

export function startAll() {
    startSyncProvider()
    startCleanupProvider()
}

export function startCleanupProvider() {
    return new SharedWorker(new URL("./cleanup_worker.ts", import.meta.url), { type: "module" })
}

export function startSyncProvider() {
    return new SharedWorker(new URL("./sync_worker.ts", import.meta.url), { type: "module" })
}

