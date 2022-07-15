const { pool } = require("./mysql_connection");

const getUsersLocation = async (
  min_age,
  max_age,
  gender,
  interests,
  latLL,
  lngLL,
  latUR,
  lngUR
) => {
  let sql = `
    SELECT 
      u.id,
      u.nickname,
      u.created_at,
      u.website,
      u.profile_image,
      u.bio,
      u.geo_location_lat,
      u.geo_location_lng,
      u.gender, 
      JSON_ARRAYAGG(i.name) as interests,
      DATE_FORMAT(FROM_DAYS(DATEDIFF(now(), u.birthdate)), '%Y')+0 AS age
      FROM users AS u 
    LEFT JOIN user_interests AS ui ON u.id = ui.user_id 
    LEFT JOIN interests AS i ON ui.interest_id = i.id 
    WHERE u.display_geo_location = true`;
  const sqlBindings = [];
  const sqlCondition = ` GROUP BY u.id`;
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
          sql += " AND ( ? ";
        } else {
          sql += " OR ? ";
        }
        sqlBindings.push(interest);
      }
      sql += ") ";
      sql +=
        "IN (SELECT i.name FROM user_interests AS ui LEFT JOIN interests AS i ON ui.interest_id = i.id WHERE ui.user_id = u.id)";
    } else {
      sql +=
        " AND ? IN (SELECT i.name FROM user_interests AS ui LEFT JOIN interests AS i ON ui.interest_id = i.id WHERE ui.user_id = u.id)";
      sqlBindings.push(interests);
    }
  }
  if (lngLL > 0 && lngUR < 0) {
    sql += ` AND u.geo_location_lat BETWEEN ? AND ?
             AND (u.geo_location_lng BETWEEN ? AND 180 OR u.geo_location_lng BETWEEN -180 AND ?)`;
    sqlBindings.push(latLL, latUR, lngLL, lngUR);
  } else {
    sql += ` AND u.geo_location_lat BETWEEN ? AND ?
             AND u.geo_location_lng BETWEEN ? AND ?`;
    sqlBindings.push(latLL, latUR, lngLL, lngUR);
  }
  const [result] = await pool.query(`${sql}${sqlCondition}`, sqlBindings);
  return result;
};

module.exports = { getUsersLocation };
