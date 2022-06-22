const { TOKEN_EXPIRATION } = process.env;
const { pool } = require("./mysql_connection");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { generateToken, verifyToken } = require("../../utilities/utilities");

const signUp = async (name, email, password, location, website) => {
  const sql = `INSERT INTO users (name, email, password, location, website) VALUES (?, ?, ?, ?, ?)`;
  const hash = await bcrypt.hash(password, saltRounds);
  const sqlBindings = [name, email, hash, location, website];
  try {
    const [result] = await pool.query(sql, sqlBindings);
    const access_token = generateToken(
      result.insertId,
      name,
      email,
      location,
      website
    );
    return {
      access_token,
      access_expiration: TOKEN_EXPIRATION,
      id: result.insertId,
    };
  } catch (error) {
    return {
      error: "Email Already Exists",
      status: 403,
    };
  }
};

const nativeSignIn = async (signInEmail, signInPassword) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  const sqlBindings = [signInEmail];
  const [result] = await pool.query(sql, sqlBindings);
  if (result.length === 0) {
    return {
      error: "Email is not registered",
      status: 403,
    };
  }
  const { id, name, email, password, location, website } = result[0];
  const match = await bcrypt.compare(signInPassword, password);
  if (!match) {
    return {
      error: "Password is incorrect",
      status: 403,
    };
  } else {
    const access_token = generateToken(
      id,
      name,
      signInEmail,
      location,
      website
    );
    return {
      access_token,
      access_expiration: TOKEN_EXPIRATION,
      user: {
        id,
        name,
        email,
        location,
        website,
      },
    };
  }
};

const profile = (accessToken) => {
  try {
    const { id, name, email, location, website } = verifyToken(accessToken);
    return { id, name, email, location, website };
  } catch (error) {
    return { status: 403, error: "Invalid Token" };
  }
};

const getUserInfo = async (userId) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  const sqlBindings = [userId];
  const [result] = await pool.query(sql, sqlBindings);
  if (result.length === 0) {
    return {
      error: "User id is invalid",
      status: 403,
    };
  }
  return result[0];
};

const getUserPosts = async (userId) => {
  const sql = `SELECT * FROM posts WHERE user_id = ?`;
  const sqlBindings = [userId];
  const sqlCondition = `ORDER BY created_at DESC LIMIT 20`;
  const [result] = await pool.query(`${sql} ${sqlCondition}`, sqlBindings);
  return result;
};

const addPost = async (userId, text) => {
  const sql = `INSERT INTO posts (user_id, text) VALUES (?, ?)`;
  const sqlBindings = [userId, text];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

const addRelationship = async (followerUserid, followedUserId) => {
  const sql = `INSERT INTO relationships (follower_user_id, followed_user_id) VALUES (?, ?)`;
  const sqlBindings = [followerUserid, followedUserId];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

const removeRelationship = async (followerUserid, followedUserId) => {
  const sql = `DELETE FROM relationships WHERE follower_user_id = ? AND followed_user_id = ?`;
  const sqlBindings = [followerUserid, followedUserId];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

module.exports = {
  signUp,
  nativeSignIn,
  profile,
  getUserInfo,
  getUserPosts,
  addPost,
  addRelationship,
  removeRelationship,
};
