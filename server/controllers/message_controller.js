require("dotenv").config();
const Message = require("../models/message_model");
const User = require("../models/user_model");
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
    const messageUserId = new Set();
    const messageUserIdList = [];
    for (let i = 0; i < result.length; i++) {
      const {
        sender_user_id,
        receiver_user_id,
        nickname,
        profile_image,
        content,
      } = result[i];
      if (
        messageUserId.has(sender_user_id) ||
        messageUserId.has(receiver_user_id)
      ) {
        continue;
      }
      messageUserId.add(
        sender_user_id === parseInt(currentUserId)
          ? receiver_user_id
          : sender_user_id
      );

      messageUserIdList.push({
        sender_user_id,
        receiver_user_id,
        nickname,
        profile_image,
        content,
      });
    }
    res.status(200).json({ messageUserIdList: messageUserIdList });
  } else {
    res.status(200).json(result);
  }
  return;
};

const saveMessages = async (req, res) => {
  const { currentUserId, targetUserId } = req.params;
  const { content, type } = req.body;
  if (!type || (type != "placeholder" && !content)) {
    res.status(400).json({ error: "content and type are required" });
    return;
  }
  const blockStatus = await User.getBlockStatus(currentUserId, targetUserId);
  let result;
  if (!blockStatus.targetUserBlockCurrentUser) {
    result = await Message.saveMessages(
      currentUserId,
      targetUserId,
      content,
      type
    );
  }
  res.status(200).json(result);
};

module.exports = { getMessages, saveMessages };
