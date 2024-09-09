Architecture
============

Metro Demonstrator uses a __Client-Server-Repository__ architecture. The central Repository holding all the data is split into a __main repository__ on the server (which is the only source of truth) and a __cache repository__ on the client. Conceptually, multiple __Providers__ fetch data and store them in the main repository. The client fetches data from the main repository into the cache repository periodically. The __User Interface__ is informed on new data in the cache repository and requests specific data from there.

![Abstract Architecture](architecture.png)

![Data Model](model.png)

## Server
The server is bootstrapped in `./server.ts`. The file bootstraps the __data updater__ (in `./src/repo/updater.js`) and the __Express server__ serving the client files and the API. The client files are served by _Vite Express_.

![Server](server.png)

### API
The API version `v1` is implemented in `./src/repo/v1.ts` and provides access to the repository by `./src/repo/v1/repo_access.ts`. By now, there is only a `BaseRepo` which provides data for `CarsharingStations`, `Scooters`, `Bikes` and `TramDepartures`. For derived data, a new repository should be considered; the BaseRepo is only for base/raw data.

Each data type in the BaseRepo can be accessed by the API `/v1/TYPE/` where TYPE is the data type from the `BaseRepo` enum. The API provides access to `./current`, holding the data with the latest timestamp, `./TIMESTAMP`, holding the data for the requested timestamp and `./FROM/UNTIL`, holding all the data between and including the requested time range. Additionally, the API provides an array of all available timestamps at `./available`. The API provides `ETag` and `if-none-match` header functionality to aid caching. 

The second API provided by the Server is the videos API. `/videos` lists all available videos with their URLs and `/video/VIDEO` provides the requested video. The API supports video range queries.

### Data updater

The data updater is implemented in `./src/repo/updater.ts`. Note that this file is compiled to a `.js` file and `./server.ts` references this as `.js`. The updater fetches new data every `UPDATE_INTERVAL` ms and deletes all data older than `CLEANUP_AGE` ms. Every registered provider is queried for new data. The providers are registered in `.src/provider/providers.ts`.

### Provider

Every source for base data is connected trough a `provider`. A provider needs to implement the `Provider` interface (`./src/model/provider.ts`). The `fetch` function is required to fetch the relevant data and to return an array of data points. The data needs to implement the `Storeable` interface (`./src/model/storeable.ts`), which requires the data to have an `id` and a `timestamp`.

Provider need to be registered in `./src/provider/providers.ts` in order to be used. This requires instantiating a `Provider` instance, declaring a repo in the `BaseRepo` that the provider's data belongs to and declaring a user readable provider name for debugging purposes.

## Client

The client is implemented with Vue.js and Vite. Entry point is `./src/main.ts` which creates a new component from `./src/App.vue`. The UI is handled by vue components. The synchronization of the __cache repository__ with the __main repository__ is done by  shared background workers. These workers are started in `./src/StartupView.vue`.

![Client](client.png)

### Cache Repository
The cache repository synchronizes itself with the main repository by using the repository APIs. The synchronization logic is handled in `./src/worker/sync_repo.ts`. For each repo in the `BaseRepo`, a separate sync repo is created in `./src/worker/sync.ts`. The file `./src/sync_worker.ts` is the entry point for the worker thread. The underlying cache repository interface is defined in `./src/storage/cache_repo.ts`.

### User Interface

The UI is composed of the different views which are registered in `./src/App.vue` in the `views` array. The views are separate vue components. 

The map rendering is contained in `./src/view/map/*`. Maps consist of a `LocationFrame`, which manages the displayed map section and provides location and rendering information to subcomponents. Those subcomponents are the `TileRenderer` for the Map Tiles, the `LineRenderer` for rendering lines between two coordinates and the `MarkerRenderer` for rendering markers on specific coordinates. The `MarkerRenderer` requires a `SpriteManager` for managing the the render sprites for the markers. The `TileRenderer` requires a `TileProvider` for accessing the rendered map tiles.

![Map Component](map.png)
