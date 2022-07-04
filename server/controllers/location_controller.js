const Location = require("../models/location_model");

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
  res.status(200).json(result);
  return;
};
module.exports = { getUsersLocation };
