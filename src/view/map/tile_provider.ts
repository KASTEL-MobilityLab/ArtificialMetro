import { TILE_SIZE, type TileCoordinate } from "./tiles"

export class TileProvider {
    private url = ""

    constructor(url: string) {
        this.url = url
    }

    fetchTile(coords: TileCoordinate): Promise<OffscreenCanvas> {
        return new Promise((resolve, reject) => {
            const canvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE)
            const img = document.createElement('img') as HTMLImageElement
            img.onerror = reject
            img.onload = () => {
                console.log('image loaded')
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0)
                resolve(canvas)
            }
            img.src = fillUrl(this.url, coords)
        })
    }


}

function fillUrl(url: string, coords: TileCoordinate): string {
    return url
        .replace("{x}", `${coords.x}`)
        .replace("{y}", `${coords.y}`)
        .replace("{z}", `${coords.scale}`)
}