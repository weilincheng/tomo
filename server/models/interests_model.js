const { pool } = require("./mysql_connection");
const getInterests = async () => {
  const sql = `SELECT JSON_ARRAYAGG( name ) AS interests FROM (SELECT name, category, ROW_NUMBER() OVER (ORDER BY name) AS seqnum FROM interests) AS y GROUP BY category`;
  const [result] = await pool.query(sql);
  return result;
};

module.exports = { getInterests };
