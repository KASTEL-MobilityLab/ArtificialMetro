export function startCarsharingProvider() {
    return new Worker(new URL("./carsharing_worker.ts", import.meta.url), { type: "module" })
}

export function startScooterProvider() {
    return new SharedWorker(new URL("./scooter_worker.ts", import.meta.url), { type: "module" })
}