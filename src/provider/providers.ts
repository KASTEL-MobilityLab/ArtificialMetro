import type { Provider } from "@/model/provider"
import { BaseRepo } from "@/model/repos"
import type { Storeable } from "@/model/storeable"
import { CarsharingProvider } from "./carsharing"
import { ScooterProvider } from "./scooter"
import { NextbikeProviderV1 } from "./nextbike_v1"
import { NextbikeProviderV2 } from "./nextbike_v2"

export type ProviderDeclaration = {
    name: string,
    repo: BaseRepo,
    provider: Provider<Storeable>,
}

const providers: ProviderDeclaration[] = [
    {
        name: "carsharing",
        repo: BaseRepo.CarsharingStations,
        provider: new CarsharingProvider(),
    },
    {
        name: "scooters",
        repo: BaseRepo.Scooters,
        provider: new ScooterProvider(),
    },
    {
        name: "nextbike v1",
        repo: BaseRepo.Bikes,
        provider: new NextbikeProviderV1(),
    },
    {
        name: "nextbike v2",
        repo: BaseRepo.Bikes,
        provider: new NextbikeProviderV2(),
    }
]

export default providers