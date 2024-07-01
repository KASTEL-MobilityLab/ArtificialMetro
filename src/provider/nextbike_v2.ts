import { type Bike } from "@/model/vehicles";
import type { Provider } from "../model/provider";

const endpoint = "https://gbfs.nextbike.net/maps/gbfs/v2/nextbike_fg/en/free_bike_status.json"
const attribution = "Nextbike"

export class NextbikeProviderV2 implements Provider<Bike> {
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
            provider: "nextbike2",
        }
        bikes.push(bike)
    }

    return bikes
}

