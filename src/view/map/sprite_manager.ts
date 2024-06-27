export type Sprite = {
    name: string,
    size: number,
}
export type SpriteAsset = Sprite & {
    url: string,
}

export class SpriteManager {
    private sprites: { [key: string]: OffscreenCanvas } = {}

    fetchSprite(sprite: SpriteAsset): Promise<OffscreenCanvas> {
        const size = sprite.size
        return new Promise((resolve, reject) => {
            const canvas = new OffscreenCanvas(size, size)
            const img = document.createElement('img') as HTMLImageElement
            img.onerror = reject
            img.onload = () => {
                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, size, size)
                this.sprites[spriteHash(sprite)] = canvas
                resolve(canvas)
            }
            img.src = sprite.url
        })
    }

    async fetchSprites(sprites: SpriteAsset[]): Promise<any> {
        const promises: Promise<any>[] = []
        for (const sprite of sprites) {
            if (!(spriteHash(sprite) in this.sprites)) {
                promises.push(this.fetchSprite(sprite))
            }
        }

        await Promise.all(promises)
    }

    getSprite(sprite: Sprite): OffscreenCanvas {
        const hash = spriteHash(sprite)
        if (hash in this.sprites) {
            return this.sprites[hash]
        } else {
            return new OffscreenCanvas(sprite.size, sprite.size)
        }
    }
}

function spriteHash(sprite: Sprite): string {
    return `${sprite.size}@${sprite.name}`
}