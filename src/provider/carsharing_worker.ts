import * as carsharing from "./carsharing"

globalThis.setInterval(() => {
    carsharing.load()
}, 5 * 60 * 1000)

carsharing.load()