import * as cleanup from "./cleanup"

globalThis.setInterval(() => {
    cleanup.cleanup()
}, 15 * 60 * 1000 /* 15min */)

cleanup.cleanup()