export interface Coordinate {
    lat: number,
    lon: number,
}

export interface CarsharingStation {
    id: string,
    provider: string,
    name: string,
    available: number,
    timestamp: string,
    position: Coordinate,
}

export interface Scooter {
    id: string,
    provider: string,
    timestamp: string,
    position: Coordinate,
}

export function geometryToCoordinate(geometry: string): Coordinate {
    geometry = geometry.substring(7)
    const splitter = geometry.indexOf(" ")
    const lon = geometry.substring(0, splitter)
    let lat = geometry.substring(splitter + 1)
    lat = lat.substring(0, lat.length - 1)

    return { lat: parseFloat(lat), lon: parseFloat(lon) }
}