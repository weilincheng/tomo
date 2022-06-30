const Location = require("../models/location_model");

const getUsersLocation = async (req, res) => {
  const { min_age, max_age, gender, interests } = req.query;
  const result = await Location.getUsersLocation(
    min_age,
    max_age,
    gender,
    interests
  );
  res.status(200).json(result);
  return;
};
module.exports = { getUsersLocation };
