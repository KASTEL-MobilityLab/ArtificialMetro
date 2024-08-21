import { BaseRepo } from "./repos"

export const brands: { name: string, title: string, icon: string, repo: BaseRepo }[] = [
    { name: "stadtmobil_karlsruhe", title: "Stadtmobil", icon: "/brands/stadtmobil_karlsruhe.svg", repo: BaseRepo.CarsharingStations },
    { name: "nextbike", title: "Nextbike", icon: "/brands/nextbike.svg", repo: BaseRepo.Bikes },
    { name: "voi_karlsruhe", title: "Voi", icon: "/brands/scooter_voi.svg", repo: BaseRepo.Scooters },
    { name: "bolt_karlsruhe", title: "Bolt", icon: "/brands/scooter_bolt.svg", repo: BaseRepo.Scooters },
]

export const tramLines: { [key: string]: { color: string, type: "tram" | "bus" } } = {
    "S1": {color: "#00A76D", type: "tram"},
    "S11": {color: "#00A76D", type: "tram"},
    "S2": { color: "#A066AA", type: "tram" },
    "S3": { color: "#FFDD00", type: "tram" },
    "S4": { color: "#9F184C", type: "tram" },
    "S5": { color: "#F69795", type: "tram" },
    "S51": { color: "#F69795", type: "tram" },
    "S52": { color: "#F69795", type: "tram" },
    "S7": { color: "#FFF200", type: "tram" },
    "S8": { color: "#6E692A", type: "tram" },
    "1": { color: "#ED1C24", type: "tram" },
    "2": { color: "#0071BC", type: "tram" },
    "3": { color: "#6E692A", type: "tram" },
    "4": { color: "#FFCB04", type: "tram" },
    "5": { color: "#00C0F3", type: "tram" },
    "30": { color: "#00AEEF", type: "bus" },
    "42": { color: "#485E88", type: "bus" },
    "71": { color: "#B2A291", type: "bus" },
    "125": { color: "#808285", type: "bus" },
}

export const tramStation = "/brands/tram-kvv.svg"

export function tramLineSprite(line: string, size: number): OffscreenCanvas | undefined {
    const brand = tramLines[line]
    const canvas = new OffscreenCanvas(size, size)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = brand.color
    ctx.beginPath()
    ctx.roundRect(0, 0, size, size, 3)
    ctx.fill()
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    const fontSize = line.length <= 2 ? 15 : 12
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.fillText(line, size / 2, size / 4 * 3)
    return canvas
}

export function tramStationSprite(color: string, size: number): OffscreenCanvas | undefined {
    const canvas = new OffscreenCanvas(size, size)
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.beginPath()
    ctx.fillStyle = color
    ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI)
    ctx.fill()
    return canvas
}