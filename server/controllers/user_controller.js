require("dotenv").config();
const User = require("../models/user_model");
const { TOKEN_SECRET, TOKEN_EXPIRATION } = process.env;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (id, name, email) => {
  return jwt.sign({ id, name, email }, TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

const signUp = async (req, res) => {
  const [result] = await User.signUp();
  res
    .status(200)
    .json({ status: "success", message: "User created successfully", result });
};

const signIn = async (req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "User sign in successfully" });
};

module.exports = { signUp, signIn };
