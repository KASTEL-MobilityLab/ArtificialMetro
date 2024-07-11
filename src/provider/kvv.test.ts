import { expect, test } from 'vitest'
import * as kvv from './kvv'

test('Handle empty json', async () => {
    const json = {
        parameters: [{ name: "serverTime", value: (new Date()).toISOString() }],
        departureList: [],
    }
    const response = { json: async () => json } as any
    const departures = await kvv.extractDepartures(response, "Earth")

    expect(departures.length).toEqual(0)
})

test('Extract departures from json', async () => {
    const json = {
        parameters: [{ name: "serverTime", value: (new Date()).toISOString() }],
        departureList: [
            {
                platform: "A",
                servingLine: {
                    key: "54321",
                    symbol: "21",
                    direction: "up",
                },
                dateTime: {
                    year: "2024",
                    month: "7",
                    day: "11",
                    hour: "22",
                    minute: "0"
                },
                realDateTime: {
                    year: "2024",
                    month: "7",
                    day: "11",
                    hour: "22",
                    minute: "15"
                },
            },
            {
                platform: "B",
                servingLine: {
                    key: "1234",
                    symbol: "S42",
                    direction: "down",
                },
                dateTime: {
                    year: "2024",
                    month: "7",
                    day: "11",
                    hour: "22",
                    minute: "17"
                }, // realDateTime is skipped
            },
        ]
    }
    const response = { json: async () => json } as any
    const departures = await kvv.extractDepartures(response, "Earth")

    expect(departures.length).toEqual(2)

    const first = departures[0]
    expect(first.id).toEqual("Earth-54321")
    expect(first.line).toEqual("21")
    expect(first.direction).toEqual("up")
    expect(first.track).toEqual("A")
    expect(first.planned).toEqual(new Date("2024-07-11T22:00:00Z"))
    expect(first.realtime).toEqual(new Date("2024-07-11T22:15:00Z"))

    const last = departures[1]
    expect(last.id).toEqual("Earth-1234")
    expect(last.line).toEqual("S42")
    expect(last.direction).toEqual("down")
    expect(last.track).toEqual("B")
    expect(last.planned).toEqual(new Date("2024-07-11T22:17:00Z"))
    expect(last.realtime).toEqual(new Date("2024-07-11T22:17:00Z"))
})