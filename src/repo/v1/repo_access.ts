import type { Storeable } from "@/model/storeable";
import { BaseRepo } from "@/storage/base_store";
import { Router } from "express";
import { DataStore } from "../data_store";

const dateTimeRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/

export function repoAccess<T extends Storeable>(repo: BaseRepo): Router {
    const router = Router()

    router.get('/current', (_, res) => {
        DataStore.open<T, BaseRepo>(repo, async ds => {
            const data = await ds.current()
            const latestTimestamp = await ds.getLatestTimestamp() ?? new Date()
            res.header('Etag', latestTimestamp.toISOString())
            res.json(data)
        })
    })

    router.get('/:timestamp', (req, res) => {
        const timestamp = req.params.timestamp
        if (timestamp.match(dateTimeRegex)) {
            DataStore.open<T, BaseRepo>(repo, async ds => {
                const data = await ds.forTimestamp(new Date(timestamp))
                res.header('Etag', timestamp)
                res.json(data)
            }).catch(() => {
                res.sendStatus(501)
            })
        } else {
            res.sendStatus(404)
        }
    })

    router.get('/*', (req, res) => {
        res.sendStatus(404)
    })

    return router
}