export type Coordinate = {
    lat: number,
    lon: number,
}

export type EasingFunction = (factor: number) => number

export function easeInOutCubic(x: number): number {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function easeInOutSine(x: number): number {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

export function easeInOutQuad(x: number): number {
    return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

export function interpolateCoordinates(start: Coordinate, end: Coordinate, factor: number, easing?: EasingFunction): Coordinate {
    const f = easing ? easing(factor) : factor
    const lat = start.lat + (end.lat - start.lat) * f
    const lon = start.lon + (end.lon - start.lon) * f
    return { lat, lon }
}