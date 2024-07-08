import type { Provider } from "@/model/provider";
import type { TramDeparture } from "@/model/vehicles";

const endpoint = "https://projekte.kvv-efa.de/sl3-alone/XSLT_DM_REQUEST?outputFormat=JSON&coordOutputFormat=WGS84%5Bdd.ddddd%5D&depType=stopEvents&locationServerActive=1&mode=direct&name_dm=7000238&type_dm=stop&useOnlyStops=1&useRealtime=1&limit=10"

export class KVVProvider implements Provider<TramDeparture> {
    attribution(): string {
        return "KVV"
    }
    async fetch(): Promise<TramDeparture[]> {
        const response = await fetch(endpoint, { headers: { 'accept-encoding': 'deflate' } })
        const departures = await extractDepartures(response)
        return departures
    }

}

async function extractDepartures(response: Response): Promise<TramDeparture[]> {
    const departures = []
    const currentTime = new Date()

    const json = await response.json()
    for (const record of json.departureList) {
        try {
            const realtime = parseTimestamp(record.realDateTime)
            const planned = parseTimestamp(record.dateTime)
            const id = `${record.servingLine.key}-${planned.toISOString()}`
            
            const departure: TramDeparture = {
                id,
                timestamp: currentTime,
                line: record.servingLine.symbol,
                track: record.platform,
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

function parseTimestamp(record: any): Date {
    const year = record.year
    const month = record.month
    const day = record.day
    const hour = record.hour
    const minute = record.minute
    return new Date(`${year}-${month}-${day} ${hour}:${minute}`)
}