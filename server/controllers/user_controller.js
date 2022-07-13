require("dotenv").config();
const User = require("../models/user_model");
const Notifications = require("../models/notifications_model");
const Message = require("../models/message_model");
const validator = require("validator");
const { s3Upload } = require("../../utilities/utilities");

const checkUserIdExist = (targetUserId, req, res) => {
  if (!targetUserId || !validator.isInt(targetUserId, { min: 1 })) {
    res.status(403).json({ error: "Target user id is invalid" });
    return;
  }
};

const signUp = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !password || !email) {
    res.status(400).json({ error: "Name, password, email are required" });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).json({ error: "Email is invalid" });
    return;
  }

  const profileImage = `asset/default_profile.png`;
  const backgroundImage = `asset/default_background.jpg`;

  const result = await User.signUp(
    name,
    email,
    password,
    profileImage,
    backgroundImage
  );
  if (result.status === 403) {
    res.status(403).json({ error: result.error });
    return;
  }
  res.status(200).json({
    access_token: result.access_token,
    access_expiration: result.access_expiration,
    user: {
      id: result.id,
      nickname: name,
      email,
    },
  });
};

const nativeSignIn = async (email, password) => {
  const result = await User.nativeSignIn(email, password);
  return result;
};

const signIn = async (req, res) => {
  const { provider, email, password } = req.body;
  if (!provider || !password || !email) {
    res.status(400).json({ error: "provider, password, email are required" });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).json({ error: "Email is invalid" });
    return;
  }
  let result;
  switch (provider) {
    case "native":
      result = await nativeSignIn(email, password);
      break;
    default:
      result = { error: "Wrong Request" };
  }
  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
};

const profile = async (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.status(401).json({ error: "No token" });
    return;
  }
  const token = authorization.split(" ")[1];
  const result = await User.profile(token);
  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
  return;
};

const getUserInfo = async (req, res) => {
  const { userId } = req.params;
  if (!userId || !validator.isInt(userId, { min: 1 })) {
    res.status(403).json({ error: "User id is invalid" });
    return;
  }
  const result = await User.getUserInfo(userId);
  if (result.error) {
    res.status(result.status).json({ error: result.error });
    return;
  }
  res.status(200).json(result);
  return;
};

const updateUserInfo = async (req, res) => {
  const { userId } = req.params;
  if (userId != req.userId) {
    res.status(403).json({ error: "You are not authorized" });
  }
  const { "profile-image": profileImage, "background-image": backgroundImage } =
    req.files;
  const {
    nickname,
    bio,
    "geo-location-lat": geoLocationLat,
    "geo-location-lng": geoLocationLng,
    website,
    "display-geo-location": displayGeoLocation,
    birthdate,
    gender,
    interests,
  } = req.body;
  let profileImageName, backgroundImageName;
  if (profileImage) {
    const result = await s3Upload(profileImage);
    profileImageName = result;
  }
  if (backgroundImage) {
    const result = await s3Upload(backgroundImage);
    backgroundImageName = result;
  }
  User.updateUserInfo(
    userId,
    nickname,
    bio,
    geoLocationLat,
    geoLocationLng,
    displayGeoLocation === "on" ? true : false,
    website,
    profileImageName,
    backgroundImageName,
    birthdate ? birthdate : null,
    gender
  );
  const [interestNameIdMapResult] = await User.getInterestsNameMap();
  const interestNameIdMap = interestNameIdMapResult.nameIdMap;
  const interestsId = interests.split(",").map((name) => {
    return interestNameIdMap[name];
  });
  User.updateUserInterests(userId, interestsId);
  return res.status(200).json({ status: "Save successfully" });
};

const getPosts = async (req, res) => {
  const { userId } = req.params;
  const result = await User.getPosts(userId);
  res.status(200).json(result);
  return;
};

const addPost = async (req, res) => {
  const { "post-content": content } = req.body;
  const { userId } = req.params;
  const { "post-images": postImages } = req.files;
  const postResult = await User.addPost(userId, content);
  const postId = postResult.insertId;
  if (postImages) {
    const fileNames = await s3Upload(postImages);
    const result = await User.addPostImages(postId, fileNames);
  }
  const followers = await User.getRelationships(userId, "followers");
  const blockedUsers = await User.getBlockStatus(userId, "allBlocked");
  let blockedUsersId;
  if (blockedUsers.length > 0) {
    blockedUsersId = blockedUsers[0].blockedUsers;
  }
  for (const follower of followers) {
    const { follower_user_id: receiverId } = follower;
    if (blockedUsersId && blockedUsersId.includes(receiverId)) {
      continue;
    }
    await Notifications.addNotification(receiverId, userId, "post", content);
  }
  res.status(200).json({ status: "Post added" });
  return;
};

const removePost = async (req, res) => {
  const { userId, postId } = req.params;
  if (req.userId != userId) {
    res.status(403).json({ error: "You are not authorized" });
  }
  await User.removePostImages(postId);
  await User.removePost(postId);
  res.status(200).json({ status: "Post removed" });
  return;
};

const getRelationships = async (req, res) => {
  const { targetUserId } = req.params;
  checkUserIdExist(targetUserId, req, res);
  const following = await User.getRelationships(targetUserId, "following");
  const followers = await User.getRelationships(targetUserId, "followers");
  res.status(200).json({ following, followers });
  return;
};

const addRelationship = async (req, res) => {
  const { targetUserId } = req.params;
  checkUserIdExist(targetUserId, req, res);
  const result = await User.addRelationship(req.userId, targetUserId);
  const isMutualFollowing = await User.checkMutualStatus(
    targetUserId,
    req.userId
  );
  const blockedStatus = await User.getBlockStatus(req.userId, targetUserId);
  const isBlocked = blockedStatus.targetUserBlockCurrentUser;
  if (!isBlocked) {
    await Notifications.addNotification(targetUserId, req.userId, "follow", "");
    if (isMutualFollowing) {
      await Notifications.addNotification(
        targetUserId,
        req.userId,
        "message",
        ""
      );
      await Notifications.addNotification(
        req.userId,
        targetUserId,
        "message",
        ""
      );
      await Message.saveMessages(
        req.userId,
        targetUserId,
        "System Message: You are mutual following now.",
        "text"
      );
    }
  }
  res.status(200).json(result);
  return;
};

const removeRelationship = async (req, res) => {
  const { targetUserId } = req.params;
  checkUserIdExist(targetUserId, req, res);
  const result = await User.removeRelationship(req.userId, targetUserId);
  res.status(200).json(result);
  return;
};

const getBlockStatus = async (req, res) => {
  const currentUserId = req.userId;
  const { targetUserId } = req.params;
  const result = await User.getBlockStatus(currentUserId, targetUserId);
  res.status(200).json(result);
  return;
};

const addBlockStatus = async (req, res) => {
  const currentUserId = req.userId;
  const { targetUserId } = req.params;
  const result = await User.addBlockStatus(currentUserId, targetUserId);
  res.status(200).json(result);
  return;
};

const removeBlockStatus = async (req, res) => {
  const currentUserId = req.userId;
  const { targetUserId } = req.params;
  const result = await User.removeBlockStatus(currentUserId, targetUserId);
  res.status(200).json(result);
  return;
};

module.exports = {
  signUp,
  signIn,
  getUserInfo,
  updateUserInfo,
  profile,
  getPosts,
  addPost,
  removePost,
  getRelationships,
  addRelationship,
  removeRelationship,
  getBlockStatus,
  addBlockStatus,
  removeBlockStatus,
};
