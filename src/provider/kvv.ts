import type { Provider } from "@/model/provider";
import type { TramDeparture } from "@/model/vehicles";

const LIMIT = 30
export const endpoint = "https://projekte.kvv-efa.de/sl3-alone/XSLT_DM_REQUEST?outputFormat=JSON&coordOutputFormat=WGS84%5Bdd.ddddd%5D&depType=stopEvents&locationServerActive=1&mode=direct&name_dm={STATION}&type_dm=stop&useOnlyStops=1&useRealtime=1&limit={LIMIT}"

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

export async function extractDepartures(response: Response, station: string): Promise<TramDeparture[]> {
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
    if (record == undefined) {
        return fallback
    }
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


if (import.meta.vitest) {
    const { expect, test } = import.meta.vitest

    test('Handle empty json', async () => {
        const json = {
            parameters: [{ name: "serverTime", value: (new Date()).toISOString() }],
            departureList: [],
        }
        const response = { json: async () => json } as any
        const departures = await extractDepartures(response, "Earth")

        expect(departures.length).toEqual(0)
    })

    test('Extract departures from json', async () => {
        const json = {
            parameters: [{ name: "serverTime", value: (new Date()).toISOString() }],
            departureList: [
                {
                    platform: "A",
                    servingLine: {
                        key: "54321",
                        symbol: "21",
                        direction: "up",
                    },
                    dateTime: {
                        year: "2024",
                        month: "7",
                        day: "11",
                        hour: "22",
                        minute: "0"
                    },
                    realDateTime: {
                        year: "2024",
                        month: "7",
                        day: "11",
                        hour: "22",
                        minute: "15"
                    },
                },
                {
                    platform: "B",
                    servingLine: {
                        key: "1234",
                        symbol: "S42",
                        direction: "down",
                    },
                    dateTime: {
                        year: "2024",
                        month: "7",
                        day: "11",
                        hour: "22",
                        minute: "17"
                    }, // realDateTime is skipped
                },
            ]
        }
        const response = { json: async () => json } as any
        const departures = await extractDepartures(response, "Earth")

        expect(departures.length).toEqual(2)

        const first = departures[0]
        expect(first.id).toEqual("Earth-54321")
        expect(first.line).toEqual("21")
        expect(first.direction).toEqual("up")
        expect(first.track).toEqual("A")
        expect(first.planned).toEqual(new Date("2024-07-11T22:00:00Z"))
        expect(first.realtime).toEqual(new Date("2024-07-11T22:15:00Z"))

        const last = departures[1]
        expect(last.id).toEqual("Earth-1234")
        expect(last.line).toEqual("S42")
        expect(last.direction).toEqual("down")
        expect(last.track).toEqual("B")
        expect(last.planned).toEqual(new Date("2024-07-11T22:17:00Z"))
        expect(last.realtime).toEqual(new Date("2024-07-11T22:17:00Z"))
    })
}