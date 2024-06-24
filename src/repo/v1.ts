import type { Scooter, CarsharingStation, Bike } from "@/model/vehicles"
import { Router } from "express"
import { BaseRepo } from "@/model/repos"
import { repoAccess } from "./v1/repo_access"


const router = Router()
router.use('/carsharing_stations', repoAccess<CarsharingStation>(BaseRepo.CarsharingStations))
router.use('/scooters', repoAccess<Scooter>(BaseRepo.Scooters))
router.use('/bikes', repoAccess<Bike>(BaseRepo.Bikes))

export default router
