const Location = require("../models/location_model");

const getUsersLocation = async (req, res) => {
  const {
    min_age,
    max_age,
    gender,
    interests,
    latLL,
    lngLL,
    latUR,
    lngUR,
    zoomLevel,
  } = req.query;
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
  const aggregatedUsersLocation = aggregateUsersLocation(
    result,
    parseFloat(latLL),
    parseFloat(lngLL),
    parseFloat(latUR),
    parseFloat(lngUR),
    parseInt(zoomLevel)
  );
  res.status(200).json(aggregatedUsersLocation);
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
  if (zoomLevel >= 17) {
    return usersLocation;
  }
  const factor = 5;
  const colNum = zoomLevel > factor ? zoomLevel - factor : 1;
  const rowNum = zoomLevel > factor ? zoomLevel - factor : 1;
  if (latUR < 0 && latLL > 0) {
    latUR = latUR + 360;
  }
  const gridWidth = Math.abs(latUR - latLL) / colNum;
  const gridHeight = Math.abs(lngUR - lngLL) / rowNum;

  const usersLocationGrids = new Map([]);
  for (const userLocation of usersLocation) {
    const { geo_location_lat: userLat, geo_location_lng: userLng } =
      userLocation;
    const rowIndex = Math.floor((userLng - lngLL) / gridHeight);
    const colIndex = Math.floor((userLat - latLL) / gridWidth);
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

module.exports = { getUsersLocation };
