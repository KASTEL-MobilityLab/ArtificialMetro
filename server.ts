import express from "express"
import ViteExpress from "vite-express"
import * as v1 from "./src/repo/v1"

const app = express()
v1.use(app)
ViteExpress.listen(app, 3000)