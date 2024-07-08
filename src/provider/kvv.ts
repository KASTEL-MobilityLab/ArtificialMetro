import type { Provider } from "@/model/provider";
import type { TramDeparture } from "@/model/vehicles";

const LIMIT = 20
const endpoint = "https://projekte.kvv-efa.de/sl3-alone/XSLT_DM_REQUEST?outputFormat=JSON&coordOutputFormat=WGS84%5Bdd.ddddd%5D&depType=stopEvents&locationServerActive=1&mode=direct&name_dm={STATION}&type_dm=stop&useOnlyStops=1&useRealtime=1&limit={LIMIT}"

export class KVVProvider implements Provider<TramDeparture> {
    private station: string

    constructor(station: string) {
        this.station = station
    }

    attribution(): string {
        return "KVV"
    }
    async fetch(): Promise<TramDeparture[]> {
        const url = endpoint.replace("{LIMIT}", `${LIMIT}`).replace("{STATION}", this.station)
        const response = await fetch(url, { headers: { 'accept-encoding': 'deflate' } })
        const departures = await extractDepartures(response, this.station)
        return departures
    }

}

async function extractDepartures(response: Response, station: string): Promise<TramDeparture[]> {
    const departures = []
    const currentTime = new Date()

    const json = await response.json()
    const serverTime = new Date(
        (json.parameters as any[])
            .filter(p => p.name == "serverTime")
            .map(p => p.value)[0] ?? new Date()
    )
    const timeAdjustment = serverTime.getTime() - currentTime.getTime()
    for (const record of json.departureList) {
        try {
            const planned = parseTimestamp(record.dateTime, currentTime, timeAdjustment)
            const realtime = parseTimestamp(record.realDateTime, planned, timeAdjustment)
            const id = `${station}-${record.servingLine.key}`

            const departure: TramDeparture = {
                id,
                timestamp: currentTime,
                line: record.servingLine.symbol,
                track: record.platform,
                direction: record.servingLine.direction,
                station,
                planned,
                realtime,
            }
            departures.push(departure)
        } catch {
            console.warn("Cannot read", record)
        }
    }

    return departures
}

function parseTimestamp(record: any, fallback: Date, timeAdjustment: number): Date {
    if (record == undefined) return fallback
    const year = record.year
    const month = record.month
    const day = record.day
    const hour = record.hour
    const minute = record.minute
    const timestamp = new Date(`${year}-${month}-${day} ${hour}:${minute}`)
    const adjustedTimestamp = new Date(timestamp.getTime() - timeAdjustment)
    adjustedTimestamp.setSeconds(0)
    adjustedTimestamp.setMilliseconds(0)
    return adjustedTimestamp
}