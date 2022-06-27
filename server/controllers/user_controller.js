require("dotenv").config();
const User = require("../models/user_model");
const Notifications = require("../models/notifications_model");
const validator = require("validator");
const { s3Upload } = require("../../utilities/utilities");

const checkUserIdExist = (targetUserId, req, res) => {
  if (!targetUserId || !validator.isInt(targetUserId, { min: 1 })) {
    res.status(403).json({ error: "Target user id is invalid" });
    return;
  }
};

const signUp = async (req, res) => {
  const { name, email, password, location, website } = req.body;
  if (!name || !password || !email) {
    res.status(400).json({ error: "Name, password, email are required" });
    return;
  }
  if (!validator.isEmail(email)) {
    res.status(400).json({ error: "Email is invalid" });
    return;
  }

  if (website && !validator.isURL(website)) {
    res.status(400).json({ error: "Website is invalid" });
    return;
  }
  const result = await User.signUp(name, email, password, location, website);
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
      location,
      website,
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
  const { nickname, bio, location, website } = req.body;
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
    location,
    website,
    profileImageName,
    backgroundImageName
  );
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
  for (const follower of followers) {
    const { follower_user_id: receiverId } = follower;
    await Notifications.addNotification(receiverId, userId, "post", content);
  }
  res.status(200).json({ status: "Post added" });
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
  await Notifications.addNotification(targetUserId, req.userId, "follow", "");
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

module.exports = {
  signUp,
  signIn,
  getUserInfo,
  updateUserInfo,
  profile,
  getPosts,
  addPost,
  getRelationships,
  addRelationship,
  removeRelationship,
};
