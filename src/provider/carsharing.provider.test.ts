import { expect, test } from 'vitest'
import * as carsharing from './carsharing'
import * as csv from "web-csv-toolbox"

test("NVBW MobiData BW Carsharing provider returns expected CSV file", async () => {
    const response = await fetch(carsharing.endpoint, {headers: { 'accept-encoding': 'deflate'}})
    const iterator = csv.parse(response)
    const firstRecord = (await iterator.next()).value
    expect('FID' in firstRecord).toBeTruthy()
    expect('feed_id' in firstRecord).toBeTruthy()
    expect('num_vehicles_available' in firstRecord).toBeTruthy()
    expect('geometry' in firstRecord).toBeTruthy()
    expect(isNaN(parseInt(firstRecord.num_vehicles_available))).toBeFalsy()
    expect(firstRecord.geometry.match(/^POINT \([0-9]+\.[0-9]+ [0-9]+\.[0-9]+\)$/)).toBeTruthy()
})