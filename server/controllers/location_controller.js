const Location = require("../models/location_model");
const clustering = require("density-clustering");
const MIN_AGGREGATE_ZOOM_LEVEL = 19;
const MIN_AGGREGATE_COUNT = 3;

const getUsersLocation = async (req, res) => {
  const { gender, interests, latLL, lngLL, latUR, lngUR, zoomLevel } =
    req.query;
  let { min_age, max_age } = req.query;
  min_age = parseInt(min_age) === 20 ? null : parseInt(min_age);
  max_age = parseInt(max_age) === 100 ? null : parseInt(max_age);
  const result = await Location.getUsersLocation(
    min_age,
    max_age,
    gender,
    interests,
    latLL,
    lngLL,
    latUR,
    lngUR
  );
  const aggregatedUsersLocationByKMeans = await aggregateUsersLocationByKMeans(
    result,
    parseFloat(latLL),
    parseFloat(lngLL),
    parseFloat(latUR),
    parseFloat(lngUR),
    parseInt(zoomLevel)
  );
  res.status(200).json(aggregatedUsersLocationByKMeans);
  return;
};

const aggregateUsersLocationByKMeans = async (
  usersLocation,
  latLL,
  lngLL,
  latUR,
  lngUR,
  zoomLevel
) => {
  if (zoomLevel > MIN_AGGREGATE_ZOOM_LEVEL) {
    return usersLocation;
  }
  const dataset = usersLocation.map((userLocation) => {
    return [userLocation.geo_location_lat, userLocation.geo_location_lng];
  });
  let k = zoomLevel;
  const kmeans = new clustering.KMEANS();
  if (dataset.length <= MIN_AGGREGATE_COUNT) {
    return usersLocation;
  }
  k = dataset.length <= k ? dataset.length - 1 : k;
  const clusters = kmeans.run(dataset, k);
  const result = [];
  for (const cluster of clusters) {
    if (cluster.length > 1) {
      let clusterMarkerLatSum = 0,
        clusterMarkerLngSum = 0,
        largestLat = Number.NEGATIVE_INFINITY,
        largestLng = Number.NEGATIVE_INFINITY,
        smallestLat = Number.POSITIVE_INFINITY,
        smallestLng = Number.POSITIVE_INFINITY;
      for (const userIdx of cluster) {
        const userLat = usersLocation[userIdx].geo_location_lat,
          userLng = usersLocation[userIdx].geo_location_lng;
        clusterMarkerLatSum += userLat;
        clusterMarkerLngSum += userLng;
        largestLat = userLat > largestLat ? userLat : largestLat;
        largestLng = userLng > largestLng ? userLng : largestLng;
        smallestLat = userLat < smallestLat ? userLat : smallestLat;
        smallestLng = userLng < smallestLng ? userLng : smallestLng;
      }
      const clusterMarkerLat = clusterMarkerLatSum / cluster.length;
      const clusterMarkerLng = clusterMarkerLngSum / cluster.length;

      result.push({
        type: "clusterMarker",
        geo_location_lat: clusterMarkerLat,
        geo_location_lng: clusterMarkerLng,
        clusterSize: cluster.length,
        clusterBoundsLatLL: smallestLat,
        clusterBoundsLngLL: smallestLng,
        clusterBoundsLatUR: largestLat,
        clusterBoundsLngUR: largestLng,
      });
    } else {
      result.push(usersLocation[cluster[0]]);
    }
  }
  return result;
};

module.exports = { getUsersLocation };
