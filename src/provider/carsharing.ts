import * as csv from "web-csv-toolbox"

const endpoint = "https://api.mobidata-bw.de/geoserver/MobiData-BW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobiData-BW%3Asharing_stations_car&maxFeatures=20000&outputFormat=csv"
const attribution = "NVBW MobiData BW"

type Coordinate = [number, number];

const channel = new BroadcastChannel("carsharing");

export async function load() {
    const response = await fetch(endpoint)

    for await (const record of csv.parse(response)) {
        const coordinate = geoToCoordinate(record.geometry)
        channel.postMessage(coordinate)
    }

}

function geoToCoordinate(geometry: string): Coordinate {
    geometry = geometry.substring(7);
    const splitter = geometry.indexOf(" ");
    const first = geometry.substring(0, splitter);
    let second = geometry.substring(splitter+1);
    second = second.substring(0, second.length - 1);

    return [parseFloat(second), parseFloat(first)]
}