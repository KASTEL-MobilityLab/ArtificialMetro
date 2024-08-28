import { Router } from "express";
import { readdir } from "fs";

export function listVideos(): Router {
    const router = Router()

    router.get('/', (_, res) => {
        readdir('data/videos', (err, files) => {
            if (err) {
                sendServerError(res)
                return
            }
            const videoUrls = files.map(file => `/v1/video/${file}`)
            res.json(videoUrls)
        })
    })

    return router
}

function sendServerError(res: any) {
    res.sendStatus(500);
}