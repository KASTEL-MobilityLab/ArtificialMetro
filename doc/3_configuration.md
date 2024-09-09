Configuration
=============

## Live View
By default, live view displays a map of Karlsruhe with three zoom presets. You can alter the presets in `./src/model/bounds.ts`. The `PRESETS` array holds available presets. `position` denotes the center of the map. The other constants are used to filter out all data that is out of bounds. Make sure to change these bounds as well when you display a different city. In this case, you may need to add additional or different data providers as well. 

## Timelapse View
Timelapse View and Live View use the same maps. Any configuration changes for Live View take effect for Timelapse View as well.

## Departures View
The stations displayed in Departures View are defined in `./src/view/MultiDeparturesView.vue`. Change the `station` and `title` properties. The stations use internal station IDs. You can discover them by observing the network traffic of the KVV EFA webapp.

## Underground View
The stations displayed in the Underground View are defined in `./src/model/stations.ts`. The `Station` enum maps the station names to their station ID. Alter this enum to load data for additional stations. The `stationGeoposition` map assigns geopositions to the stations. The Underground View will display the station at this position. Finally, `stationConnections` defines the direct connections between stations. Only these connections are observed and displayed. 

To change the map section by adjusting `zoom` and `center` in `./src/view/UndergroundView.vue`.

## Landscape View
Landscape View serves random excerpts from videos found in `./videos`. Supported formats depend on the browser and platform used. `mp4` should work in most cases. Make sure that videos have a minimum length of 90 seconds. Changes in the video directory take effect after reloading the webapp.