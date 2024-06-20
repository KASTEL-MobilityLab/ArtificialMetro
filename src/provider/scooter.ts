import { geometryToCoordinate, type Scooter } from "@/model/vehicles";
import * as csv from "web-csv-toolbox"
import { isInBounds } from "./bounds";
import type { Provider } from "./provider";

const endpoint = "https://api.mobidata-bw.de/geoserver/MobiData-BW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobiData-BW%3Asharing_vehicles&CQL_FILTER=form_factor%20%3D%20%27scooter%27&maxFeatures=20000&outputFormat=csv"
export const attribution = "NVBW MobiData BW"

export class ScooterProvider implements Provider<Scooter> {
    attribution(): string {
        return attribution
    }
    async fetch(): Promise<Scooter[]> {
        // Force deflate encoding, because gzip has errors in node.js implementation
        const response = await fetch(endpoint, { headers: { 'accept-encoding': 'deflate' } })
        const scooters = await extractScooter(response)
        return scooters
    }
}

async function extractScooter(response: Response): Promise<Scooter[]> {
    const scooters = []
    const currentTime = new Date()

    for await (const record of csv.parse(response)) {
        const coordinate = geometryToCoordinate(record.geometry)
        if (!isInBounds(coordinate)) {
            continue
        }
        const station: Scooter = {
            id: record.FID,
            timestamp: currentTime,
            position: coordinate
        }
        scooters.push(station)
    }
    return scooters
}

