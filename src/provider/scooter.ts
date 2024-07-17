import { geometryToCoordinate, type Scooter } from "@/model/vehicles";
import * as csv from "web-csv-toolbox"
import { isInBounds } from "../model/bounds";
import type { Provider } from "../model/provider";

export const endpoint = "https://api.mobidata-bw.de/geoserver/MobiData-BW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobiData-BW%3Asharing_vehicles&CQL_FILTER=form_factor%20%3D%20%27scooter%27&maxFeatures=20000&outputFormat=csv"
const attribution = "NVBW MobiData BW"

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
            position: coordinate,
            provider: record.feed_id,
        }
        scooters.push(station)
    }
    return scooters
}


if (import.meta.vitest) {
    const { expect, test } = import.meta.vitest

    const createStream = (data: string): ReadableStream => {
        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(data)
                controller.close()
            }
        })
        return stream
    }

    test("CSV file without records", async () => {
        const response = createStream("FID,feed_id,geometry")
        const stations = await extractScooter(response as any)
        expect(stations).toEqual([])
    })

    test("Extract Scooters from CSV result", async () => {
        const data = `FID,feed_id,geometry
5a530bb20d1dff00063bd779,test,POINT (8.403653 49.006889)
5a966f70af71190006b85c83,test,POINT (8.403653 49.006889)
5a967008af71190006b85c9b,test,POINT (8.403653 49.006889)`
        const response = createStream(data)
        const stations = await extractScooter(response as any)
        expect(stations.length).toBe(3)

        expect(stations[0].id).toEqual("5a530bb20d1dff00063bd779")
        expect(stations[0].position).toEqual({ lon: 8.403653, lat: 49.006889 })
        expect(stations[0].provider).toEqual("test")

        expect(stations[2].id).toEqual("5a967008af71190006b85c9b")
        expect(stations[2].position).toEqual({ lon: 8.403653, lat: 49.006889 })
        expect(stations[2].provider).toEqual("test")
    })

    test("CSV Records with coordinates out of bounds", async () => {
        // first entry is out of bounds
        const data = `FID,feed_id,geometry
5a530bb20d1dff00063bd779,test,POINT (8.741309 48.714709)
5a966f70af71190006b85c83,test,POINT (8.403653 49.006889)`
        const response = createStream(data)
        const stations = await extractScooter(response as any)
        expect(stations.length).toBe(1)
    })

}