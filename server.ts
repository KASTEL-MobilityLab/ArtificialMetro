import express from "express"
import ViteExpress from "vite-express"
import * as v1 from "./src/repo/v1"
import {SHARE_ENV, Worker} from "node:worker_threads"

const tsx = new URL(import.meta.resolve('tsx/cli'))
new Worker(tsx, {env: SHARE_ENV, argv: ["./src/repo/updater.js"]})

const app = express()
v1.use(app)
ViteExpress.listen(app, 3000)