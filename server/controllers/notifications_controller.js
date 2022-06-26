const Notifications = require("../models/notifications_model");

const getNotifications = async (req, res) => {
  const userId = req.userId;
  const result = await Notifications.getNotifications(userId);
  res.status(200).json(result);
  return;
};

module.exports = { getNotifications };
