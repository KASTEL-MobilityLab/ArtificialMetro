import { TILE_SIZE, type BoundingBox, type TileCoordinate } from "./tiles"

export class TileProvider {
    private url = ""
    private tiles: {[key: string]: OffscreenCanvas} = {}

    constructor(url: string) {
        this.url = url
    }

    private fetchTile(coords: TileCoordinate): Promise<OffscreenCanvas> {
        return new Promise((resolve, reject) => {
            const canvas = new OffscreenCanvas(TILE_SIZE, TILE_SIZE)
            const img = document.createElement('img') as HTMLImageElement
            img.onerror = reject
            img.onload = () => {
                console.log('image loaded')
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0)
                this.tiles[tileHash(coords)] = canvas
                resolve(canvas)
            }
            img.src = fillUrl(this.url, coords)
        })
    }

    async fetchRange(range: BoundingBox<TileCoordinate>): Promise<any> {
        const promises: Promise<any>[] = []
        for (let x = range.topLeft.x; x < range.bottomRight.x; ++x) {
            for (let y = range.topLeft.y; y < range.bottomRight.y; ++y) {
                const coord = {x, y, scale: range.topLeft.scale}
                if (!(tileHash(coord) in this.tiles)) {
                    promises.push(this.fetchTile(coord))
                }
            }
        }
        await Promise.all(promises)
    }

    getTile(coords: TileCoordinate): OffscreenCanvas {
        const hash = tileHash(coords)
        if (hash in this.tiles) {
            return this.tiles[hash]
        } else {
            return new OffscreenCanvas(TILE_SIZE, TILE_SIZE)
        }
    }

}

function fillUrl(url: string, coords: TileCoordinate): string {
    return url
        .replace("{x}", `${coords.x}`)
        .replace("{y}", `${coords.y}`)
        .replace("{z}", `${coords.scale}`)
}

function tileHash(coords: TileCoordinate): string {
    return `${coords.scale}/${coords.x}/${coords.y}`
}