import { describe, expect, test } from 'vitest'
import * as scooter from './scooter'
import * as csv from "web-csv-toolbox"

const isProviderTest = process.env.PROVIDER_TEST === "true"

describe.skipIf(!isProviderTest)('Provider Test', () => {
    test("NVBW MobiData BW Scooter available", async () => {
        const response = await fetch(scooter.endpoint, { headers: { 'accept-encoding': 'deflate' } })
        expect(response.ok).toBeTruthy()
    })

    test("NVBW MobiData BW Scooter provider returns expected CSV file", async () => {
        const response = await fetch(scooter.endpoint, { headers: { 'accept-encoding': 'deflate' } })
        const iterator = csv.parse(response)
        const firstRecord = (await iterator.next()).value
        expect('FID' in firstRecord).toBeTruthy()
        expect('feed_id' in firstRecord).toBeTruthy()
        expect('geometry' in firstRecord).toBeTruthy()
        expect(firstRecord.geometry.match(/^POINT \([0-9]+\.[0-9]+ [0-9]+\.[0-9]+\)$/)).toBeTruthy()
    })
})