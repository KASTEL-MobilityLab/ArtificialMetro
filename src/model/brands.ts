import { BaseRepo } from "./repos"

export const brands: { name: string, title: string, icon: string, repo: BaseRepo }[] = [
    { name: "stadtmobil_karlsruhe", title: "Stadtmobil", icon: "/brands/stadtmobil_karlsruhe.svg", repo: BaseRepo.CarsharingStations },
    { name: "nextbike", title: "Nextbike", icon: "/brands/nextbike.svg", repo: BaseRepo.Bikes },
    { name: "voi_karlsruhe", title: "Voi", icon: "/brands/scooter_voi.svg", repo: BaseRepo.Scooters },
    { name: "bolt_karlsruhe", title: "Bolt", icon: "/brands/scooter_bolt.svg", repo: BaseRepo.Scooters },
]

export const tramLines: { [key: string]: { color: string, type: "tram" | "bus" } } = {
    "S2": { color: "#A066AA", type: "tram" },
    "S5": { color: "#F69795", type: "tram" },
    "S51": { color: "#F69795", type: "tram" },
    "S4": { color: "#9F184C", type: "tram" },
    "1": { color: "#ED1C24", type: "tram" },
    "2": { color: "#0071BC", type: "tram" },
    "S7": { color: "#FFF200", type: "tram" },
    "S8": { color: "#6E692A", type: "tram" },
    "4": { color: "#FFCB04", type: "tram" },
    "3": { color: "#6E692A", type: "tram" },
    "30": { color: "#00AEEF", type: "bus" },
    "42": { color: "#485E88", type: "bus" },
    "71": { color: "#B2A291", type: "bus" },
    "125": { color: "#808285", type: "bus" },
}