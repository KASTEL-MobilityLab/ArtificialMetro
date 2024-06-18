export function normalizeTimestamp(timestamp: Date): Date {
    const minutes = timestamp.getMinutes()
    timestamp.setMinutes(Math.floor(minutes / 5) * 5)
    timestamp.setSeconds(0)
    timestamp.setMilliseconds(0)
    return timestamp
}
