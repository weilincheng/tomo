require("dotenv").config();
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_CONNECTION_LIMIT } =
  process.env;

const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  processword: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: DB_CONNECTION_LIMIT,
  queueLimit: 0,
});

module.exports = { pool };
