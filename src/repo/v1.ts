import { Router } from "express"
import { BaseRepo } from "@/model/repos"
import { repoAccess } from "./v1/repo_access"
import type { Storeable } from "@/model/storeable"


const router = Router()

for (const repo in BaseRepo) {
    router.use(`/${repo}`, repoAccess<Storeable>(repo as BaseRepo))
}

export default router
