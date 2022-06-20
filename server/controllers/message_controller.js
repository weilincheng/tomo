require("dotenv").config();
const Message = require("../models/message_model");
const User = require("../models/user_model");
const validator = require("validator");

const getMessages = async (req, res) => {
  const { authorization } = req.headers;
  const { userId } = req.params;
  if (!authorization) {
    res.status(401).json({ error: "No token" });
    return;
  }
  if (!userId || !validator.isInt(userId, { min: 1 })) {
    res.status(403).json({ error: "User id is invalid" });
    return;
  }
  const token = authorization.split(" ")[1];
  try {
    const result = await User.verifyToken(token);
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
    return;
  }
  const result = await Message.getMessages(userId);
  res.status(200).json(result);
  return;
};

module.exports = { getMessages };
