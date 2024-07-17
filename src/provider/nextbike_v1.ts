import { type Bike } from "@/model/vehicles";
import type { Provider } from "../model/provider";

export const endpoint = "https://gbfs.nextbike.net/maps/gbfs/v1/nextbike_fg/en/free_bike_status.json"
const attribution = "Nextbike"

export class NextbikeProviderV1 implements Provider<Bike> {
    attribution(): string {
        return attribution
    }
    async fetch(): Promise<Bike[]> {
        // Force deflate encoding, because gzip has errors in node.js implementation
        const response = await fetch(endpoint, { headers: { 'accept-encoding': 'deflate' } })
        const bikes = await extractBikes(response)
        return bikes
    }
}

async function extractBikes(response: Response): Promise<Bike[]> {
    const bikes = []
    const currentTime = new Date()

    const json = await response.json()
    for (const record of json.data.bikes) {
        const bike: Bike = {
            id: record.bike_id,
            timestamp: currentTime,
            position: {
                lat: record.lat,
                lon: record.lon,
            },
            provider: "nextbike",
        }
        bikes.push(bike)
    }

    return bikes
}


if (import.meta.vitest) {
    const { expect, test } = import.meta.vitest

    test("Empty bikes array", async () => {
        const json = { data: { bikes: [] } }
        const response = { async json() { return json } } as any
        const bikes = await extractBikes(response)

        expect(bikes.length).toBe(0)
    })

    test("Extract bikes from json correctly", async () => {
        const json = {
            data: {
                bikes: [
                    { bike_id: "001", lon: 8.403653, lat: 49.006889 },
                    { bike_id: "foo", lon: 8.403653, lat: 49.006889 },
                    { bike_id: "bar", lon: 8.403653, lat: 49.006889 }
                ]
            }
        }
        const response = { async json() { return json } } as any
        const bikes = await extractBikes(response)

        expect(bikes.length).toBe(3)

        expect(bikes[0].id).toEqual("001")
        expect(bikes[0].position).toEqual({ lon: 8.403653, lat: 49.006889 })
        expect(bikes[0].provider).toEqual("nextbike")

        expect(bikes[2].id).toEqual("bar")
        expect(bikes[2].position).toEqual({ lon: 8.403653, lat: 49.006889 })
        expect(bikes[2].provider).toEqual("nextbike")
    })
}