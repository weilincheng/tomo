const { pool } = require("./mysql_connection");
const getInterests = async () => {
  const sql = `SELECT JSON_ARRAYAGG( name ) AS interests FROM (select name, category, ROW_NUMBER() OVER (ORDER BY name) as seqnum from interests) as y GROUP BY category`;
  const [result] = await pool.query(sql);
  return result;
};

module.exports = { getInterests };
