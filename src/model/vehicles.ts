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