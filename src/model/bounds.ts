import type { Coordinate } from "@/model/vehicles"

const UPPER_LAT = 49.0650
const LOWER_LAT = 48.9763
const LEFT_LON = 8.314
const RIGHT_LON = 8.493

// This function is tailored to Karlsruhe and therefore to locations on the
// northern and eastern hemisphere.
export function isInBounds(coordinate: Coordinate): boolean {
    if (coordinate.lat < LOWER_LAT || coordinate.lat > UPPER_LAT) return false
    if (coordinate.lon < LEFT_LON || coordinate.lon > RIGHT_LON) return false
    return true
}

export const PRESETS = [
    {
      position: {
        lat: 49.006889,
        lon: 8.403653,
      },
      zoom: 14,
    },
    {
      position: {
        lat: 49.011620,
        lon: 8.417007,
      },
      zoom: 16,
    },
    {
      position: {
        lat: 49.013618,
        lon: 8.419233,
      },
      zoom: 17,
    }
  ]