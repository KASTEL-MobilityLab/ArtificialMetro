import { describe, expect, test } from 'vitest'
import * as kvv from './kvv'

const stations = [
    ["7001001"], ["7001002"]
]

const isProviderTest = process.env.PROVIDER_TEST === "true"

describe.skipIf(!isProviderTest)('Provider Test', () => {

    test.each(stations)("KVV available", async station => {
        const url = kvv.endpoint.replace("{LIMIT}", `2`).replace("{STATION}", station)
        const response = await fetch(url, { headers: { 'accept-encoding': 'deflate' } })
        expect(response.ok).toBeTruthy()
    })

    test.each(stations)("KVV returns expected JSON", async station => {
        const url = kvv.endpoint.replace("{LIMIT}", `2`).replace("{STATION}", station)
        const response = await fetch(url, { headers: { 'accept-encoding': 'deflate' } })
        const json = await response.json()
        expect('parameters' in json).toBeTruthy()
        const parameters = json.parameters as any[]
        assertServerTime(parameters)
        expect('departureList' in json).toBeTruthy()
        const departureList = json.departureList
        expect(Array.isArray(departureList)).toBeTruthy()
        expect(departureList.length).toBeGreaterThanOrEqual(1)

        for (const departure of departureList) {
            expect('platform' in departure).toBeTruthy()
            expect('servingLine' in departure).toBeTruthy()
            assertServingLine(departure.servingLine)
            expect('dateTime' in departure).toBeTruthy()
            assertDateTime(departure.dateTime)
            if ('realDateTime' in departure) {
                assertDateTime(departure.realDateTime)
            }
        }
    })

})

const TIMESTAMP_REGEX = /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/
function assertServerTime(parameters: any[]) {
    parameters.forEach(param => {
        expect('name' in param).toBeTruthy()
        expect('value' in param).toBeTruthy()
        if (param.name == 'serverTime') {
            expect(param.value.match(TIMESTAMP_REGEX)).toBeTruthy()
        }
    })
}

function assertServingLine(servingLine: any) {
    expect('key' in servingLine).toBeTruthy()
    expect('symbol' in servingLine).toBeTruthy()
    expect('direction' in servingLine).toBeTruthy()
    expect('trainNum' in servingLine).toBeTruthy()
}

function assertDateTime(data: any) {
    expect('year' in data).toBeTruthy()
    expect('month' in data).toBeTruthy()
    expect('day' in data).toBeTruthy()
    expect('hour' in data).toBeTruthy()
    expect('minute' in data).toBeTruthy()
}