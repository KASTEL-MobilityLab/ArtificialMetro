import * as scooter from "./scooter"

globalThis.setInterval(() => {
    scooter.load()
}, 5 * 60 * 1000)

scooter.load()