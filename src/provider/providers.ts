import type { Provider } from "@/model/provider"
import { BaseRepo } from "@/model/repos"
import type { Storeable } from "@/model/storeable"
import { CarsharingProvider } from "./carsharing"
import { ScooterProvider } from "./scooter"
import { NextbikeProviderV1 } from "./nextbike_v1"
import { NextbikeProviderV2 } from "./nextbike_v2"
import { KVVProvider } from "./kvv"

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
    },
    {
        name: "KVV Durlacher Tor",
        repo: BaseRepo.TramDepartures,
        provider: new KVVProvider("7001001"),
    },
    {
        name: "KVV Kronenplatz",
        repo: BaseRepo.TramDepartures,
        provider: new KVVProvider("7001002"),
    },
    {
        name: "KVV Marktplatz Kaiserstraße",
        repo: BaseRepo.TramDepartures,
        provider: new KVVProvider("7001003"),
    },
    {
        name: "KVV Marktplatz Pyramide",
        repo: BaseRepo.TramDepartures,
        provider: new KVVProvider("7001011"),
    },
    {
        name: "KVV Europaplatz",
        repo: BaseRepo.TramDepartures,
        provider: new KVVProvider("7001004"),
    },
    {
        name: "KVV Ettlinger Tor",
        repo: BaseRepo.TramDepartures,
        provider: new KVVProvider("7001012"),
    },
    {
        name: "KVV Kongresszentrum",
        repo: BaseRepo.TramDepartures,
        provider: new KVVProvider("7001013"),
    },
]

export default providers