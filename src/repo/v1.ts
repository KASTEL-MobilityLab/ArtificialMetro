import { Router } from "express"
import { BaseRepo } from "@/model/repos"
import { repoAccess } from "./v1/repo_access"
import type { Storeable } from "@/model/storeable"
import { listVideos } from "./v1/list_videos"
import serveStatic from "serve-static"


const router = Router()

for (const repo in BaseRepo) {
    router.use(`/${repo}`, repoAccess<Storeable>(repo as BaseRepo))
}

const videoServer = serveStatic('data/videos')
router.use('/videos', listVideos())
router.use('/video', videoServer)

export default router
