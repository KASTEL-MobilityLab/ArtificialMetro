import { geometryToCoordinate, type CarsharingStation } from "@/model/vehicles";
import * as csv from "web-csv-toolbox"

const endpoint = "https://api.mobidata-bw.de/geoserver/MobiData-BW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobiData-BW%3Asharing_stations_car&maxFeatures=20000&outputFormat=csv"
const attribution = "NVBW MobiData BW"

const channel = new BroadcastChannel("carsharing")

export async function load() {
    const response = await fetch(endpoint)
    const stations = await extractStations(response)
    channel.postMessage(stations)
}

async function extractStations(response: Response): Promise<CarsharingStation[]> {
    const stations = []

    for await (const record of csv.parse(response)) {
        const coordinate = geometryToCoordinate(record.geometry)
        const station: CarsharingStation = {
            id: record.FID,
            provider: record.feed_id,
            name: record.name,
            available: parseInt(record.num_vehicles_available),
            timestamp: record.last_reported,
            position: coordinate
        }
        stations.push(station)
    }
    return stations
}