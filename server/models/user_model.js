const { TOKEN_EXPIRATION } = process.env;
const { pool } = require("./mysql_connection");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { generateToken, verifyToken } = require("../../utilities/utilities");

const signUp = async (name, email, password, location, website) => {
  const sql = `INSERT INTO users (nickname, email, password, location, website) VALUES (?, ?, ?, ?, ?)`;
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
  const {
    id,
    nickname,
    email,
    password,
    location,
    website,
    profile_image: profileImage,
  } = result[0];
  const match = await bcrypt.compare(signInPassword, password);
  if (!match) {
    return {
      error: "Password is incorrect",
      status: 403,
    };
  } else {
    const access_token = generateToken(
      id,
      nickname,
      signInEmail,
      location,
      website,
      profileImage
    );
    return {
      access_token,
      access_expiration: TOKEN_EXPIRATION,
      user: {
        id,
        nickname,
        email,
        location,
        website,
        profile_image: profileImage,
      },
    };
  }
};

const profile = (accessToken) => {
  try {
    const { id, nickname, email, location, website, profileImage } =
      verifyToken(accessToken);
    return { id, nickname, email, location, website, profileImage };
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

const updateUserInfo = async (
  userId,
  name,
  bio,
  location,
  website,
  profileImage,
  backgroundImage
) => {
  let sql = `UPDATE users SET nickname = ?, bio = ?, location = ?, website = ? `;
  let sqlBindings = [name, bio, location, website];
  if (profileImage) {
    sql += `, profile_image = ? `;
    sqlBindings.push(profileImage);
  }
  if (backgroundImage) {
    sql += `, background_image = ? `;
    sqlBindings.push(backgroundImage);
  }
  sql += `WHERE id = ?`;
  sqlBindings.push(userId);
  const [result] = await pool.query(sql, sqlBindings);
  return { status: "Change saved" };
};

const getPosts = async (userId) => {
  const sql = `SELECT p.id, p.text, p.created_at, JSON_ARRAYAGG(i.image) AS images FROM posts AS p LEFT JOIN post_images AS i ON p.id = i.post_id WHERE p.user_id = ?`;
  const sqlBindings = [userId];
  const sqlCondition = `GROUP BY p.id ORDER BY created_at DESC`;
  const [result] = await pool.query(`${sql} ${sqlCondition}`, sqlBindings);
  return result;
};

const addPost = async (userId, text) => {
  const sql = `INSERT INTO posts (user_id, text) VALUES (?, ?)`;
  const sqlBindings = [userId, text];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

const addPostImages = async (postId, postImages) => {
  const sql = `INSERT INTO post_images (post_id, image) VALUES ?`;
  const sqlBindings = [postImages.map((image) => [postId, image])];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

const getRelationships = async (targetUserId, type) => {
  let sql = "";
  let sqlCondition = "";
  if (type === "following") {
    sql = `SELECT DISTINCT r.followed_user_id, u.nickname, u.profile_image FROM relationships AS r INNER JOIN users AS u ON r.followed_user_id = u.id`;
    sqlCondition = `WHERE follower_user_id = ? `;
  } else if (type === "followers") {
    sql = `SELECT DISTINCT r.follower_user_id, u.nickname, u.profile_image FROM relationships AS r INNER JOIN users AS u ON r.follower_user_id = u.id`;
    sqlCondition = `WHERE followed_user_id = ? `;
  }
  const sqlBindings = [targetUserId];
  const [result] = await pool.query(`${sql} ${sqlCondition}`, sqlBindings);
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
  updateUserInfo,
  getPosts,
  addPost,
  addPostImages,
  getRelationships,
  addRelationship,
  removeRelationship,
};
