export interface Coordinate {
    lat: number,
    lon: number,
}

export interface CarsharingStation {
    id: string,
    available: number,
    timestamp: Date,
    position: Coordinate,
    provider: string,
}

export interface Scooter {
    id: string,
    timestamp: Date,
    position: Coordinate,
    provider: string,
}

export interface Bike {
    id: string,
    timestamp: Date,
    position: Coordinate,
    provider: string,
}

export interface TramDeparture {
    id: string,
    timestamp: Date,
    line: string,
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