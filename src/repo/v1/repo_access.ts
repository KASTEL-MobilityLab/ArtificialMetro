import type { Storeable } from "@/model/storeable";
import { BaseRepo } from "@/storage/base_store";
import { Router, type Response } from "express";
import { DataStore } from "../data_store";

const dateTimeRegex = /[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z/

export function repoAccess<T extends Storeable>(repo: BaseRepo): Router {
    const router = Router()

    router.get('/current', (_, res) => {
        requireDatastoreOrFail<T>(res, async ds => {
            const data = await ds.current()
            const latestTimestamp = await ds.getLatestTimestamp() ?? new Date()
            sendResult<T>(res, data, latestTimestamp.toISOString())
        })
    })

    router.get('/:timestamp', (req, res) => {
        const timestamp = req.params.timestamp
        if (timestamp.match(dateTimeRegex)) {
            sendDataForTimestamp<T>(res, timestamp);
        } else {
            sendNotFound(res)
        }
    })

    function sendDataForTimestamp<T extends Storeable>(res: any, timestamp: string) {
        requireDatastoreOrFail<T>(res, async (ds) => {
            const data = await ds.forTimestamp(new Date(timestamp));
            sendResult<T>(res, data, timestamp);
        });
    }

    router.get('/*', (_, res) => {
        sendNotFound(res)
    })



    function requireDatastoreOrFail<T extends Storeable>(res: any, callback: (self: DataStore<T, BaseRepo>) => Promise<void>) {
        DataStore
            .open<T, BaseRepo>(repo, callback)
            .catch(() => {
                res.sendStatus(501)
            })
    }

    return router
}





function sendResult<T extends Storeable>(res: any, data: T[], timestamp: string) {
    res.header('Etag', timestamp);
    res.json(data);
}

function sendNotFound(res: any) {
    res.sendStatus(401)
}