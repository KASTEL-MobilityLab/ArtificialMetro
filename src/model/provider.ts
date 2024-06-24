import type { Storeable } from "@/model/storeable"

export interface Provider<T extends Storeable> {
    attribution(): string
    fetch(): Promise<T[]>
}
