import type { CarsharingStation, Coordinate } from "@/model/vehicles";
import * as csv from "web-csv-toolbox"

const endpoint = "https://api.mobidata-bw.de/geoserver/MobiData-BW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobiData-BW%3Asharing_stations_car&maxFeatures=20000&outputFormat=csv"
const attribution = "NVBW MobiData BW"

const channel = new BroadcastChannel("carsharing")

export async function load() {
    const response = await fetch(endpoint)

    for await (const record of csv.parse(response)) {
        const coordinate = geoToCoordinate(record.geometry)
        const station: CarsharingStation = {
            id: record.FID,
            provider: record.feed_id,
            name: record.name,
            available: parseInt(record.num_vehicles_available),
            timestamp: record.last_reported,
            position: coordinate
        }
        channel.postMessage(station)
    }

}

function geoToCoordinate(geometry: string): Coordinate {
    geometry = geometry.substring(7)
    const splitter = geometry.indexOf(" ")
    const lon = geometry.substring(0, splitter)
    let lat = geometry.substring(splitter + 1)
    lat = lat.substring(0, lat.length - 1)

    return { lat: parseFloat(lat), lon: parseFloat(lon) }
}