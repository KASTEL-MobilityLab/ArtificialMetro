Extending Functionality
=======================

## Add or update a brand
1. Create a brand icon in `./public/brands`.
2. Register the brand in `./src/model/brands.ts`. The `name` is the name retrieved from NVBW or given by the provider. `title` is displayed in the UI. `icon` gives the path to the icon. `repo` indicated to which means of transport the brand corresponds. This is used to remove the brand from the legend if data from this means of transport is unavailable.

## Add or update a tram line
Update the `tramLines` array in `./src/model/brands.ts`.

## Update stations or station connections
1. Find the station ID by intercepting the network requests in KVV EFA. The station id is a 7 digit number, presumably starting with `700`
2. Add the station to the `Station` enum in `./src/model/stations.ts`. A provider for the station will then be added in `./src/provider/providers.ts` automatically (see `tramProviders`)
3. Add the geoposition of the station in `stationGeopositions` in `./src/model/stations.ts`
4. Add a connection between stations in `stationConnections` in `./src/model/stations.ts`. Connections are always bidirectional.

## Add new Data Provider
If you need to add a new provider for a means of transport that already exists (e.g. new bikesharing or scooter provider).

1. Create a new provider in `./src/provider/NAME.ts` by implementing the `Provider` interface. `fetch()` needs to return a Promise with the already existing means of transport.
2. Register the provider in `./src/provider/providers.ts` with a human readable name, a repo in `BaseRepo` that defines the means of transport and an instance of the new provider.
3. Write a provider test in `./src/provider/NAME.provider.test.ts`. Check that you only run this test if the environment variable `PROVIDER_TEST` is set to `"true"`.

## Add a new means of transport
If you need to support a completely new means of transport (e.g. flying taxis).

1. Create a new interface in `./src/model/vehicles.ts`. This interface needs to extend `Storeable` or `Vehicle`. Add all required fields to this interface. 
```ts
export interface FlyingTaxi extends Vehicle {
	capacity: number,
}
```

2. Add a new field in `BaseRepo` in `./src/model/repos.ts`. The field's value needs to match the field's name exactly. Increment `BASE_REPO_VERSION`.
```ts
export enum BaseRepo {
	...
	FlyingTaxi = "FlyingTaxi",
}
export const BASE_REPO_VERSION = 4
```

3. Create a data provider that provides data for this new transport type.
4. If you want to display this transport type in the Live and Timelapse maps (your interface needs to extend `Vehicle` then), make sure the repo is used. E.g. in `./src/view/LiveView.vue:onMounted`:
```ts
onMounted(async () => {
	let store = await BaseStore.open()
	...
	repos.push(store.repo(BaseRepo.FlyingTaxi))
	...
})
```

5. Alternatively, create a new view that uses the new data.

## Derive data from base data
If you want to calculate something from data in the BaseRepo and want to provide this new data to the client.

Derived data should not go into the `BaseRepo` but rather into a `DerivedRepo`. If this is the first time such data is derived, you need to create this `DerivedRepo` first. All data in the derived repo needs to implement the `Storeable` interface as well.

./src/model/repos.ts:
```ts
export enum DerivedRepo {
	Reliability = "Reliability",
}
export const DERIVED_REPO_VERSION = 1
```
Create an equivalent to `./src/repo/v1/repo_access.ts` for the DerivedRepo. Use `DerivedRepo` instead of `BaseRepo`. Register this repo access server in `./src/repo/v1.ts` (or better, create a v2 api).

In the client, create an equivalent to the `BaseStore` for a `DerivedStore`, which opens a `CacheRepo` for the derived repo.
```ts
export class DerivedStore {
	...
	static async open(): Promise<DerivedStore> {
		const db = await openDB(DERIVED_STORE, DERIVED_REPO_VERSION, ...)
		return new DerivedStore(db)
	}

	repo<T extends Storeable>(repo: DerivedRepo): CacheRepo<T, DerivedRepo> {
		return new CacheRepo(this.db, repo, DERIVED_STORE)
	}
}
```

Finally, create an equivalent to `./src/worker/sync_repo.ts` to synchronize the `DerivedRepo`. Make sure to update the derived repo in `./src/worker/sync.ts` as well. You can then use data from the derived repo by creating a `DerivedStore` and opening the corresponding repo with `store.repo<Reliability>(DerivedRepo.Reliability)`.

To create a provider that derives data, you need to create such a provider and fiddle it into `updateAll()` in `./src/repo/updater.ts`.

## Add a new view
1. Create a vue component for the view. Your new view will receive a `bus: SwitchBusReceiver` prop. This can be used to suspend or resume background timers while the view is invisible.
2. Add a variant to the `Views` enum in `./src/App.vue`
3. Register the view in the `views` array in `./src/App.vue`. The `id` is the variant from the `Views` enum, `title` is the displayed title, `icon` is an icon from `lucide-vue-next`, `component` a reference to the vue component for the view. `available` controls whether the view is marked as available. Use `false` if you want to show the view only when certain data is available.
4. Create an availability check for the view. There you can check whether to show or to skip the view. Call this availability check in `checkAvailability` and modify the `available` value there.