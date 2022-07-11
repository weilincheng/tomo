require("dotenv").config();
const {
  DB_HOST,
  DB_HOST_PRODUCTION,
  DB_USER,
  DB_PASSWORD,
  DB_PASSWORD_PRODUCTION,
  DB_NAME,
  DB_CONNECTION_LIMIT,
  NODE_ENV,
} = process.env;

const mysql = require("mysql2/promise");
const config = {
  development: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: DB_CONNECTION_LIMIT,
    queueLimit: 0,
  },
  test: {
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "tomo_test",
    waitForConnections: true,
    connectionLimit: DB_CONNECTION_LIMIT,
    queueLimit: 0,
  },
  production: {
    host: DB_HOST_PRODUCTION,
    user: DB_USER,
    password: DB_PASSWORD_PRODUCTION,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: DB_CONNECTION_LIMIT,
    queueLimit: 0,
  },
};

const pool = mysql.createPool(config[NODE_ENV]);
module.exports = { pool };
