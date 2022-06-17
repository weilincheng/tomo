const { pool } = require("./mysql_connection");

const signUp = async (req, res) => {
  // const { name, email, password } = req.body;
  const email = "test@test.com";
  const queryStr = "SELECT * FROM users WHERE email = ?";
  const [result] = await pool.query(queryStr, email);
  const created_at = new Date(result[0].created_at);
  const month = created_at.getMonth();
  const date = created_at.getDate();
  const year = created_at.getFullYear();
  result[0].created_at = `${year}-${month}-${date}`;
  return result;
};

module.exports = { signUp };
