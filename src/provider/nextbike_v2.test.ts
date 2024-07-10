import { expect, test } from 'vitest'
import { extractBikes } from './nextbike_v2'

test("Empty bikes array", async () => {
    const json = { data: { bikes: [] } }
    const response = { async json() { return json } } as any
    const bikes = await extractBikes(response)

    expect(bikes.length).toBe(0)
})

test("Extract bikes from json correctly", async () => {
    const json = {
        data: {
            bikes: [
                { bike_id: "001", lon: 8.403653, lat: 49.006889 },
                { bike_id: "foo", lon: 8.403653, lat: 49.006889 },
                { bike_id: "bar", lon: 8.403653, lat: 49.006889 }
            ]
        }
    }
    const response = { async json() { return json } } as any
    const bikes = await extractBikes(response)

    expect(bikes.length).toBe(3)

    expect(bikes[0].id).toEqual("001")
    expect(bikes[0].position).toEqual({ lon: 8.403653, lat: 49.006889 })
    expect(bikes[0].provider).toEqual("nextbike")

    expect(bikes[2].id).toEqual("bar")
    expect(bikes[2].position).toEqual({ lon: 8.403653, lat: 49.006889 })
    expect(bikes[2].provider).toEqual("nextbike")
})