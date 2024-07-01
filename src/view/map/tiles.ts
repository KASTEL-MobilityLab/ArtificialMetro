import type { Coordinate } from "@/model/vehicles";

export const TILE_SIZE = 256

export interface ViewCoordinate {
    x: number,
    y: number,
}
export interface TileCoordinate {
    x: number,
    y: number,
    scale: number,
}

export interface Dimensions {
    width: number,
    height: number,
}

export type Offset<T> = T
export interface BoundingBox<T> {
    topLeft: T,
    bottomRight: T,
}

export interface Marker {
    position: Coordinate,
    sprite: string,
}

/* Returns the x/y/s tile for given coords */
export function tileFromCoords(coords: Coordinate, scale: number): TileCoordinate {
    return {
        x: lon2tile(coords.lon, scale),
        y: lat2tile(coords.lat, scale),
        scale
    }
}

export function posOnTile(coords: Coordinate, scale: number): ViewCoordinate {
    return {
        x: xOnTile(coords.lon, scale),
        y: yOnTile(coords.lat, scale),
    }
}

/* Returns the coordinate at the top left corner */
export function coordsFromTile(tile: TileCoordinate): Coordinate {
    return {
        lon: tile2lon(tile.x, tile.scale),
        lat: tile2lat(tile.y, tile.scale),
    }
}

export function bbFromTile(tile: TileCoordinate): BoundingBox<Coordinate> {
    return {
        topLeft: coordsFromTile(tile),
        bottomRight: coordsFromTile({
            x: tile.x + 1,
            y: tile.y + 1,
            scale: tile.scale,
        })
    }
}

function lon2tile(lon: number, lvl: number) {
    return Math.floor(
        (lon + 180) / 360 * Math.pow(2, lvl)
    )
}

function lat2tile(lat: number, lvl: number) {
    const l = lat * Math.PI / 180
    return Math.floor(
        (   1 - Math.log(
                Math.tan(l) + 1 / Math.cos(l)
            ) / Math.PI
        ) / 2 * Math.pow(2, lvl)
    )
}

function xOnTile(lon: number, lvl: number) {
    return ((lon + 180) / 360 * Math.pow(2, lvl) % 1) * TILE_SIZE
}

function yOnTile(lat: number, lvl: number) {
    const l = lat * Math.PI / 180
    return ((
        (   1 - Math.log(
                Math.tan(l) + 1 / Math.cos(l)
            ) / Math.PI
        ) / 2 * Math.pow(2, lvl)
    ) % 1) * TILE_SIZE
}

function tile2lon(x: number, lvl: number) {
    return x / Math.pow(2, lvl) * 360 - 180
}

function tile2lat(y: number, lvl: number) {
    const n = Math.PI - 2*Math.PI * y / Math.pow(2, lvl)
    return 180 / Math.PI 
        * Math.atan(
            0.5 * ( 
                Math.exp(n) - Math.exp(-n) 
            )
        )
}