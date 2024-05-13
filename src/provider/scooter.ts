import { geometryToCoordinate, type Scooter } from "@/model/vehicles";
import { BaseStore } from "@/storage/base_store";
import * as csv from "web-csv-toolbox"

const endpoint = "https://api.mobidata-bw.de/geoserver/MobiData-BW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobiData-BW%3Asharing_vehicles&CQL_FILTER=form_factor%20%3D%20%27scooter%27&maxFeatures=20000&outputFormat=csv"
export const attribution = "NVBW MobiData BW"

const store = await BaseStore.open()

export async function load() {
    const response = await fetch(endpoint)
    const scooters = await extractScooter(response);

    await store.scooters().store(scooters)
}

async function extractScooter(response: Response): Promise<Scooter[]> {
    const scooters = []

    for await (const record of csv.parse(response)) {
        const coordinate = geometryToCoordinate(record.geometry)
        const station: Scooter = {
            id: record.FID,
            provider: record.feed_id,
            timestamp: new Date(record.last_reported),
            position: coordinate
        }
        scooters.push(station)
    }
    return scooters
}