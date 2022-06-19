require("dotenv").config();
const User = require("../models/user_model");
const validator = require("validator");

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
      name,
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
  console.log(req.body);
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

module.exports = { signUp, signIn, getUserInfo, profile };
