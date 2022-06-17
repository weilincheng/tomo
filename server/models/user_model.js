const { TOKEN_SECRET, TOKEN_EXPIRATION } = process.env;
const { pool } = require("./mysql_connection");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const generateToken = (id, name, email) => {
  return jwt.sign({ id, name, email }, TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

const signUp = async (name, email, password, location, website) => {
  const sql = `INSERT INTO users (name, email, password, location, website) VALUES (?, ?, ?, ?, ?)`;
  const hash = await bcrypt.hash(password, saltRounds);
  const sqlBindings = [name, email, hash, location, website];
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
  const { id, name, email, password, location, website } = result[0];
  const match = await bcrypt.compare(signInPassword, password);
  if (!match) {
    return {
      error: "Password is incorrect",
      status: 403,
    };
  } else {
    const access_token = generateToken(id, name, signInEmail);
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

module.exports = { signUp, nativeSignIn };
