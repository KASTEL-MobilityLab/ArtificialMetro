import type { Storeable } from "./storeable"

export interface Coordinate {
    lat: number,
    lon: number,
}

export interface Vehicle extends Storeable {
    id: string,
    position: Coordinate,
    provider: string,
}

export interface CarsharingStation extends Vehicle {
    available: number,
}

export interface Scooter extends Vehicle {}

export interface Bike extends Vehicle {}

export interface TramDeparture {
    id: string,
    timestamp: Date,
    line: string,
    trainNumber: string,
    track: string,
    station: string,
    direction: string,
    planned: Date,
    realtime: Date,
}

export function geometryToCoordinate(geometry: string): Coordinate {
    geometry = geometry.substring(7)
    const splitter = geometry.indexOf(" ")
    const lon = geometry.substring(0, splitter)
    let lat = geometry.substring(splitter + 1)
    lat = lat.substring(0, lat.length - 1)

    return { lat: parseFloat(lat), lon: parseFloat(lon) }
}