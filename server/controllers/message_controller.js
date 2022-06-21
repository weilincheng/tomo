require("dotenv").config();
const Message = require("../models/message_model");
const validator = require("validator");

const getMessages = async (req, res) => {
  const { currentUserId, targetUserId } = req.params;
  if (
    !currentUserId ||
    !targetUserId ||
    !validator.isInt(currentUserId, { min: 1 }) ||
    !(validator.isInt(targetUserId, { min: 1 }) || targetUserId === "all") ||
    currentUserId === targetUserId
  ) {
    res.status(403).json({ error: "User id is invalid" });
    return;
  }
  const result = await Message.getMessages(currentUserId, targetUserId);
  if (targetUserId === "all") {
    const seenSenderUserId = new Set();
    const senderUserIdList = [];
    for (let i = 0; i < result.length; i++) {
      const senderUserId = result[i].sender_user_id;
      if (!seenSenderUserId.has(senderUserId)) {
        seenSenderUserId.add(senderUserId);
        senderUserIdList.push(senderUserId);
      }
    }
    res.status(200).json({ senderUserIdList });
  } else {
    res.status(200).json(result);
  }
  return;
};

const saveMessages = async (req, res) => {
  const { currentUserId, targetUserId } = req.params;
  const { content, type } = req.body;
  if (!content || !type) {
    res.status(400).json({ error: "content and type are required" });
    return;
  }
  const result = await Message.saveMessages(
    currentUserId,
    targetUserId,
    content,
    type
  );
  res.status(200).json(result);
};

module.exports = { getMessages, saveMessages };
