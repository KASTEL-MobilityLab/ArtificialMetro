import { geometryToCoordinate, type CarsharingStation } from "@/model/vehicles";
import * as csv from "web-csv-toolbox"
import { isInBounds } from "./bounds";
import type { Provider } from "../model/provider";

const endpoint = "https://api.mobidata-bw.de/geoserver/MobiData-BW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobiData-BW%3Asharing_stations_car&maxFeatures=20000&outputFormat=csv"
export const attribution = "NVBW MobiData BW"

export class CarsharingProvider implements Provider<CarsharingStation> {
    attribution(): string {
        return attribution
    }
    async fetch(): Promise<CarsharingStation[]> {
        // Force deflate encoding, because gzip has errors in node.js implementation
        const response = await fetch(endpoint, {headers: { 'accept-encoding': 'deflate'}})
        const stations = await extractStations(response)
        return stations
    }
}

async function extractStations(response: Response): Promise<CarsharingStation[]> {
    const stations = []
    const currentTime = new Date()

    for await (const record of csv.parse(response)) {
        const coordinate = geometryToCoordinate(record.geometry)
        if (!isInBounds(coordinate)) {
            continue
        }
        const station: CarsharingStation = {
            id: record.FID,
            available: parseInt(record.num_vehicles_available),
            timestamp: currentTime,
            position: coordinate
        }
        stations.push(station)
    }
    return stations
}

