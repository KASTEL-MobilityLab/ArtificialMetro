import type { Coordinate } from "./vehicles"

export enum Station {
    MarktplatzKaiserstrasse = "7001003",
    MarktplatzPyramide = "7001011",
    Europaplatz = "7001004",
    EttlingerTor = "7001012",
    Kongresszentrum = "7001013",
    Kronenplatz = "7001002",
    DurlacherTor = "7001001",
}

export const stationGeopositions: { [key: string]: Coordinate } = {
    [Station.MarktplatzKaiserstrasse]: { lat: 49.009656, lon: 8.403112 },
    [Station.MarktplatzPyramide]: { lat: 49.009302, lon: 8.403918 },
    [Station.Europaplatz]: { lat: 49.010013, lon: 8.395048 },
    [Station.EttlingerTor]: { lat: 49.005444, lon: 8.403502 },
    [Station.Kongresszentrum]: { lat: 49.002508, lon: 8.403188 },
    [Station.Kronenplatz]: { lat: 49.009249, lon: 8.410788 },
    [Station.DurlacherTor]: { lat: 49.008749, lon: 8.418109 },
}

export const stationConnections: [Station, Station][] = [
    [Station.DurlacherTor, Station.Kronenplatz],
    [Station.Kronenplatz, Station.MarktplatzKaiserstrasse],
    [Station.Kronenplatz, Station.MarktplatzPyramide],
    [Station.MarktplatzKaiserstrasse, Station.Europaplatz],
    [Station.MarktplatzKaiserstrasse, Station.MarktplatzPyramide],
    [Station.MarktplatzPyramide, Station.EttlingerTor],
    [Station.EttlingerTor, Station.Kongresszentrum],
]