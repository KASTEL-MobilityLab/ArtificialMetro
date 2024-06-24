export function startAll() {
    startSyncWorker()
    startCleanupWorker()
}

export function startCleanupWorker() {
    return new SharedWorker(new URL("./cleanup_worker.ts", import.meta.url), { type: "module" })
}

export function startSyncWorker() {
    return new SharedWorker(new URL("./sync_worker.ts", import.meta.url), { type: "module" })
}

