import type { Scooter, CarsharingStation } from "@/model/vehicles"
import { Router } from "express"
import { BaseRepo } from "@/storage/base_store"
import { repoAccess } from "./v1/repo_access"


const router = Router()
router.use('/carsharing_stations', repoAccess<CarsharingStation>(BaseRepo.CarsharingStations))
router.use('/scooters', repoAccess<Scooter>(BaseRepo.Scooters))

export default router
