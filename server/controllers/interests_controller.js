const Interest = require("../models/interests_model");

const getInterests = async (req, res) => {
  const result = await Interest.getInterests();
  res.status(200).json(result);
};
module.exports = { getInterests };
