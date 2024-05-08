
const endpoint = "https://api.mobidata-bw.de/geoserver/MobiData-BW/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=MobiData-BW%3Asharing_vehicles&CQL_FILTER=form_factor%20%3D%20%27car%27&maxFeatures=20000&outputFormat=csv"
const attribution = "NVBW MobiData BW"

export async function load() {
    const response = await fetch(endpoint);
    const text = await response.text()
    console.log(text);
}