const Location = require("../models/location_model");
const clustering = require("density-clustering");
const skmeans = require("skmeans");

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
  // const aggregatedUsersLocation = aggregateUsersLocation(
  //   result,
  //   parseFloat(latLL),
  //   parseFloat(lngLL),
  //   parseFloat(latUR),
  //   parseFloat(lngUR),
  //   parseInt(zoomLevel)
  // );
  const aggregatedUsersLocationByKMeans = await aggregateUsersLocationByKMeans(
    result,
    parseFloat(latLL),
    parseFloat(lngLL),
    parseFloat(latUR),
    parseFloat(lngUR),
    parseInt(zoomLevel)
  );
  // res.status(200).json(aggregatedUsersLocation);
  res.status(200).json(aggregatedUsersLocationByKMeans);
  return;
};

const aggregateUsersLocation = (
  usersLocation,
  latLL,
  lngLL,
  latUR,
  lngUR,
  zoomLevel
) => {
  if (zoomLevel >= 19) {
    return usersLocation;
  }
  const factor = 5;
  const colNum = zoomLevel > factor ? zoomLevel - factor : 1;
  const rowNum = zoomLevel > factor ? zoomLevel - factor : 1;
  if (lngUR < lngLL) {
    lngUR = lngUR + 360;
  }
  const gridHeight = Math.abs(latUR - latLL) / rowNum;
  const gridWidth = Math.abs(lngUR - lngLL) / colNum;

  const usersLocationGrids = new Map([]);
  for (const userLocation of usersLocation) {
    const { geo_location_lat: userLat, geo_location_lng: userLng } =
      userLocation;
    const colIndex = Math.floor((userLng - lngLL) / gridWidth);
    const rowIndex = Math.floor((userLat - latLL) / gridHeight);
    if (!usersLocationGrids.has(`(${rowIndex}, ${colIndex})`)) {
      usersLocationGrids.set(`(${rowIndex}, ${colIndex})`, [userLocation]);
    } else {
      usersLocationGrids.get(`(${rowIndex}, ${colIndex})`).push(userLocation);
    }
  }
  const result = [];
  for (let i = 0; i < rowNum; i++) {
    for (let j = 0; j < colNum; j++) {
      if (usersLocationGrids.has(`(${i}, ${j})`)) {
        const usersCount = usersLocationGrids.get(`(${i}, ${j})`).length;
        if (usersCount > 1) {
          let clusterMarkerLatSum = 0,
            clusterMarkerLngSum = 0;
          for (const userLocation of usersLocationGrids.get(`(${i}, ${j})`)) {
            const { geo_location_lat: userLat, geo_location_lng: userLng } =
              userLocation;
            clusterMarkerLatSum += userLat;
            clusterMarkerLngSum += userLng;
          }
          const clusterMarkerLat = clusterMarkerLatSum / usersCount;
          const clusterMarkerLng = clusterMarkerLngSum / usersCount;

          result.push({
            type: "clusterMarker",
            geo_location_lat: clusterMarkerLat,
            geo_location_lng: clusterMarkerLng,
            clusterSize: usersCount,
          });
        } else {
          result.push(usersLocationGrids.get(`(${i}, ${j})`)[0]);
        }
      }
    }
  }
  return result;
};

const aggregateUsersLocationBySKMeans = async (
  usersLocation,
  latLL,
  lngLL,
  latUR,
  lngUR,
  zoomLevel
) => {
  if (zoomLevel >= 20) {
    return usersLocation;
  }
  const dataset = usersLocation.map((userLocation) => {
    return [userLocation.geo_location_lat, userLocation.geo_location_lng];
  });
  let k = zoomLevel > 6 ? zoomLevel - 6 : 1;
  const kmeans = new clustering.KMEANS();
  console.time("run kmeans");
  console.log("Zoom level:", zoomLevel, "k:", k);
  k = dataset.length < k ? dataset.length : k;
  // const clusters = kmeans.run(dataset, k);
  console.timeEnd("run kmeans");
  console.time("run skmeans");
  const clustersSk = skmeans(dataset, k, "", 50);
  console.timeEnd("run skmeans");
  const result = [];
  const clusterMap = {};
  for (const idx of clustersSk.idxs) {
    if (cluster.length > 1) {
      let clusterMarkerLatSum = 0,
        clusterMarkerLngSum = 0;
      for (const userIdx of cluster) {
        const userLat = usersLocation[userIdx].geo_location_lat,
          userLng = usersLocation[userIdx].geo_location_lng;
        clusterMarkerLatSum += userLat;
        clusterMarkerLngSum += userLng;
      }
      const clusterMarkerLat = clusterMarkerLatSum / cluster.length;
      const clusterMarkerLng = clusterMarkerLngSum / cluster.length;

      result.push({
        type: "clusterMarker",
        geo_location_lat: clusterMarkerLat,
        geo_location_lng: clusterMarkerLng,
        clusterSize: cluster.length,
      });
    } else {
      result.push(usersLocation[cluster[0]]);
    }
  }
  return result;
};

const aggregateUsersLocationByKMeans = async (
  usersLocation,
  latLL,
  lngLL,
  latUR,
  lngUR,
  zoomLevel
) => {
  if (zoomLevel >= 20) {
    return usersLocation;
  }
  const dataset = usersLocation.map((userLocation) => {
    return [userLocation.geo_location_lat, userLocation.geo_location_lng];
  });
  let k = zoomLevel;
  const kmeans = new clustering.KMEANS();
  k = dataset.length < k ? dataset.length : k;
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
