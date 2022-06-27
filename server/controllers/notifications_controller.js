const Notifications = require("../models/notifications_model");

const getNotifications = async (req, res) => {
  const userId = req.userId;
  const result = await Notifications.getNotifications(userId);
  if (result.error) {
    res.status(403).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
  return;
};

module.exports = { getNotifications };
