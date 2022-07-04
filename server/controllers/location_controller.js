const Location = require("../models/location_model");
const colNum = 15.0,
  rowNum = 15.0;

const getUsersLocation = async (req, res) => {
  const { min_age, max_age, gender, interests, latLL, lngLL, latUR, lngUR } =
    req.query;
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

  if (latLL & lngLL & latUR & lngUR) {
    const aggregatedUsersLocation = aggregateUsersLocation(
      result,
      parseFloat(latLL),
      parseFloat(lngLL),
      parseFloat(latUR),
      parseFloat(lngUR)
    );
    res.status(200).json(aggregatedUsersLocation);
    return;
  }

  res.status(200).json(result);
  return;
};

const aggregateUsersLocation = (usersLocation, latLL, lngLL, latUR, lngUR) => {
  const gridWidth = (latUR - latLL) / colNum;
  const gridHeight = (lngUR - lngLL) / rowNum;
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
          const clusterMarkerLat = latLL + gridWidth * j + gridWidth / 2;
          const clusterMarkerLng = lngLL + gridHeight * i + gridHeight / 2;
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
