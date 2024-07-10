import { expect, test } from 'vitest'
import * as nextbike_v2 from './nextbike_v2'

test("Nextbike v2 available", async () => {
    const response = await fetch(nextbike_v2.endpoint, { headers: { 'accept-encoding': 'deflate' } })
    expect(response.ok).toBeTruthy()
})

test("Nextbike v2 returns expected JSON", async () => {
    const response = await fetch(nextbike_v2.endpoint, { headers: { 'accept-encoding': 'deflate' } })
    const json = await response.json()
    expect('data' in json).toBeTruthy()
    expect('bikes' in json.data).toBeTruthy()
    const bikes = json.data.bikes
    const firstBike = bikes[0]
    expect('bike_id' in firstBike).toBeTruthy()
    expect('lat' in firstBike).toBeTruthy()
    expect('lon' in firstBike).toBeTruthy()
    expect(isNaN(parseFloat(firstBike.lat))).toBeFalsy()
    expect(isNaN(parseFloat(firstBike.lon))).toBeFalsy()
})