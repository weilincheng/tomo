const { TOKEN_EXPIRATION } = process.env;
const { pool } = require("./mysql_connection");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { generateToken, verifyToken } = require("../../utilities/utilities");

const signUp = async (name, email, password, profileImage, backgroundImage) => {
  const sql = `INSERT INTO users (nickname, email, password, profile_image, background_image) VALUES (?, ?, ?, ?, ?)`;
  const hash = await bcrypt.hash(password, saltRounds);
  const sqlBindings = [name, email, hash, profileImage, backgroundImage];
  try {
    const [result] = await pool.query(sql, sqlBindings);
    const access_token = generateToken(result.insertId, name, email);
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
    profile_image: profileImage,
    background_image: backgroundImage,
  } = result[0];
  const match = await bcrypt.compare(signInPassword, password);
  if (!match) {
    return {
      error: "Password is incorrect",
      status: 403,
    };
  } else {
    const access_token = generateToken(id, nickname, signInEmail, profileImage);
    return {
      access_token,
      access_expiration: TOKEN_EXPIRATION,
      user: {
        id,
        nickname,
        email,
        profile_image: profileImage,
        background_image: backgroundImage,
      },
    };
  }
};

const profile = (accessToken) => {
  try {
    const { id, nickname, email, profileImage, backgroundImage } =
      verifyToken(accessToken);
    return { id, nickname, email, profileImage, backgroundImage };
  } catch (error) {
    return { status: 401, error: "Login has expired. Please sign in." };
  }
};

const getUserInfo = async (userId) => {
  const sql = ` SELECT 
    u.id,
    u.nickname,
    u.created_at,
    u.website,
    u.profile_image,
    u.background_image,
    u.bio,
    u.geo_location_lat,
    u.geo_location_lng,
    u.display_geo_location,
    u.gender,
    u.birthdate,
    JSON_ARRAYAGG(i.name) as interests 
    FROM users AS u 
    LEFT JOIN user_interests AS ui ON u.id = ui.user_id
    LEFT JOIN interests AS i ON ui.interest_id = i.id
    WHERE u.id = ? GROUP BY u.id`;
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
  geoLocationLat,
  geoLocationLng,
  displayGeoLocation,
  website,
  profileImage,
  backgroundImage,
  birthdate,
  gender
) => {
  let sql = `UPDATE users SET nickname = ?, bio = ?, geo_location_lat = ?, geo_location_lng = ?, display_geo_location = ?, website = ?, birthdate = ?, gender = ? `;
  let sqlBindings = [
    name,
    bio,
    geoLocationLat,
    geoLocationLng,
    displayGeoLocation,
    website,
    birthdate,
    gender,
  ];
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

const updateUserInterests = async (userId, interests) => {
  const sql = `DELETE FROM user_interests WHERE user_id = ?`;
  const sqlBindings = [userId];
  await pool.query(sql, sqlBindings);
  const sql2 = `INSERT INTO user_interests (user_id, interest_id) VALUES ?`;
  const sqlBindings2 = [interests.map((interest) => [userId, interest])];
  const [result] = await pool.query(sql2, sqlBindings2);
  return result;
};

const getInterestsNameMap = async () => {
  const sql = `select JSON_OBJECTAGG(name, id) as nameIdMap from interests;`;
  const [result] = await pool.query(sql);
  return result;
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

const removePost = async (postId) => {
  const sql = `DELETE FROM posts where id = ?`;
  const sqlBindings = [postId];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

const removePostImages = async (postId) => {
  const sql = `DELETE FROM post_images WHERE post_id = ?`;
  const sqlBindings = [postId];
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

const checkMutualStatus = async (followerUserId, followedUserId) => {
  const sql = `SELECT * FROM relationships WHERE follower_user_id = ? AND followed_user_id = ?`;
  const sqlBindings = [followerUserId, followedUserId];
  const [result] = await pool.query(sql, sqlBindings);
  const sql2 = `SELECT * FROM relationships WHERE follower_user_id = ? AND followed_user_id = ?`;
  const sqlBindings2 = [followedUserId, followerUserId];
  const [result2] = await pool.query(sql2, sqlBindings2);
  return result.length > 0 && result2.length > 0;
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

const getBlockStatus = async (currentUserId, targetUserId) => {
  if (targetUserId === "allBlocked") {
    const sql = `SELECT JSON_ARRAYAGG(blocked_user_id) AS blockedUsers FROM blocklist WHERE blocker_user_id = ? GROUP BY blocker_user_id`;
    const sqlBindings = [currentUserId];
    const [result] = await pool.query(sql, sqlBindings);
    return result;
  } else {
    const sql = `SELECT id FROM blocklist WHERE blocker_user_id = ? AND blocked_user_id = ?`;
    const sqlBindings = [currentUserId, targetUserId];
    const [result] = await pool.query(sql, sqlBindings);
    const sql2 = `SELECT id FROM blocklist WHERE blocker_user_id = ? AND blocked_user_id = ?`;
    const sqlBindings2 = [targetUserId, currentUserId];
    const [result2] = await pool.query(sql2, sqlBindings2);
    return {
      currentUserBlockTargetUser: result.length > 0,
      targetUserBlockCurrentUser: result2.length > 0,
    };
  }
};

const addBlockStatus = async (blockerUserid, blockedUserId) => {
  const sql = `INSERT INTO blocklist (blocker_user_id, blocked_user_id) VALUES (?, ?)`;
  const sqlBindings = [blockerUserid, blockedUserId];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

const removeBlockStatus = async (blockerUserid, blockedUserId) => {
  const sql = `DELETE FROM blocklist WHERE blocker_user_id = ? AND blocked_user_id = ?`;
  const sqlBindings = [blockerUserid, blockedUserId];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

module.exports = {
  signUp,
  nativeSignIn,
  profile,
  getUserInfo,
  updateUserInfo,
  updateUserInterests,
  getInterestsNameMap,
  getPosts,
  addPost,
  removePost,
  addPostImages,
  removePostImages,
  getRelationships,
  addRelationship,
  removeRelationship,
  checkMutualStatus,
  getBlockStatus,
  addBlockStatus,
  removeBlockStatus,
};
