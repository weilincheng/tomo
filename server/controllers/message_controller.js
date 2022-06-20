require("dotenv").config();
const Message = require("../models/message_model");
const User = require("../models/user_model");
const validator = require("validator");

const getMessages = async (req, res) => {
  const { authorization } = req.headers;
  const { currentUserId, targetUserId } = req.query;
  if (!authorization) {
    res.status(401).json({ error: "No token" });
    return;
  }
  if (
    !currentUserId ||
    !targetUserId ||
    !validator.isInt(currentUserId, { min: 1 }) ||
    !validator.isInt(targetUserId, { min: 1 }) ||
    currentUserId === targetUserId
  ) {
    res.status(403).json({ error: "User id is invalid" });
    return;
  }
  const token = authorization.split(" ")[1];
  try {
    const { id } = await User.verifyToken(token);
    if (id !== parseInt(currentUserId)) {
      res.status(403).json({ error: "You are not authorized" });
      return;
    }
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
    return;
  }
  const result = await Message.getMessages(currentUserId, targetUserId);
  res.status(200).json(result);
  return;
};

module.exports = { getMessages };
