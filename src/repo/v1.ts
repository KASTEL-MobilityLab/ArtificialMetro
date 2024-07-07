import type { Scooter, CarsharingStation, Bike } from "@/model/vehicles"
import { Router } from "express"
import { BaseRepo } from "@/model/repos"
import { repoAccess } from "./v1/repo_access"


const router = Router()
router.use('/CarsharingStations', repoAccess<CarsharingStation>(BaseRepo.CarsharingStations))
router.use('/Scooters', repoAccess<Scooter>(BaseRepo.Scooters))
router.use('/Bikes', repoAccess<Bike>(BaseRepo.Bikes))

export default router
