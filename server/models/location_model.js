const { pool } = require("./mysql_connection");

const getUsersLocation = async (min_age, max_age, gender, interests) => {
  let sql = `
    SELECT DISTINCT
      u.id,
      u.nickname,
      u.created_at,
      u.website,
      u.profile_image,
      u.bio,
      u.geo_location_lat,
      u.geo_location_lng,
      u.gender, 
      DATE_FORMAT(FROM_DAYS(DATEDIFF(now(), u.birthdate)), '%Y')+0 AS age
      FROM users AS u 
    LEFT JOIN user_interests AS ui ON u.id = ui.user_id 
    LEFT JOIN interests AS i ON ui.interest_id = i.id 
    WHERE u.display_geo_location = true`;
  const sqlBindings = [];
  const ageCalculation = `DATE_FORMAT(FROM_DAYS(DATEDIFF(now(), u.birthdate)), '%Y')+0`;
  if (min_age) {
    sql += ` AND (${ageCalculation}) >= ?`;
    sqlBindings.push(min_age);
  }
  if (max_age) {
    sql += ` AND (${ageCalculation}) <= ?`;
    sqlBindings.push(max_age);
  }
  if (gender) {
    if (Array.isArray(gender)) {
      for (const [index, item] of gender.entries()) {
        if (index === 0) {
          sql += " AND (u.gender = ? ";
        } else {
          sql += " OR u.gender = ? ";
        }
        sqlBindings.push(item);
      }
      sql += ") ";
    } else {
      sql += " AND u.gender = ? ";
      sqlBindings.push(gender);
    }
  }
  if (interests) {
    if (Array.isArray(interests)) {
      for (const [index, interest] of interests.entries()) {
        if (index === 0) {
          sql += " AND (i.interest_name = ? ";
        } else {
          sql += " OR i.interest_name = ? ";
        }
        sqlBindings.push(interest);
      }
      sql += ") ";
    } else {
      sql += " AND i.interest_name = ?";
      sqlBindings.push(interests);
    }
  }
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};

module.exports = { getUsersLocation };