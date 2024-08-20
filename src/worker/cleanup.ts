import { BaseStore } from "@/storage/base_store";
import { BaseRepo } from "@/model/repos";
import type { Storeable } from "@/model/storeable";

const CLEANUP_THRESHOLD = 3 * 60 * 60 * 1000 /* 3h */
const store = await BaseStore.open()

const repos = Object.keys(BaseRepo)

export function cleanup() {
    const time = thresholdTime()
    repos.forEach(repo => {
        store.repo<Storeable>(repo as BaseRepo).cleanupSince(time)
    })
}

function thresholdTime() {
    return new Date((new Date()).getTime() - CLEANUP_THRESHOLD);
}
