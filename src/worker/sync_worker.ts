import * as sync from "./sync"

globalThis.setInterval(() => {
    sync.sync()
}, 2 * 60 * 1000 /* 2min */)

sync.initial_sync()