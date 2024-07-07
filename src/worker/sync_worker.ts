import * as sync from "./sync"

globalThis.setInterval(() => {
    sync.incremental_sync()
}, 2 * 60 * 1000 /* 2min */)

const _self = self as any
_self.onconnect = (evt: any) => {
    const port = evt.ports[0]
    sync.initial_sync(repo => {
        port.postMessage(repo)
    })
}



