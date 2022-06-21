const { pool } = require("./mysql_connection");

const getMessages = async (currentUserId, targetUserId) => {
  let sql = `SELECT m.sender_user_id, m.receiver_user_id, m.created_at, mc.type, mc.content FROM messages AS m inner join message_content AS mc ON m.id = mc.message_id`,
    sqlBindings,
    sqlWhereCondition = ``,
    sqlLimitCondition = `ORDER BY m.created_at DESC LIMIT 20`;
  if (targetUserId === "all") {
    sqlWhereCondition = `WHERE receiver_user_id = ?`;
    sqlBindings = [currentUserId];
  } else {
    sqlWhereCondition = `WHERE (sender_user_id = ? AND receiver_user_id = ? ) OR (sender_user_id = ? AND receiver_user_id = ? )`;
    sqlBindings = [currentUserId, targetUserId, targetUserId, currentUserId];
  }
  const [result] = await pool.query(
    `${sql} ${sqlWhereCondition} ${sqlLimitCondition}`,
    sqlBindings
  );
  return result;
};

const saveMessages = async (currentUserId, targetUserId, content) => {
  const messageSql = `INSERT INTO messages (sender_user_id, receiver_user_id) VALUES (?, ?)`;
  const messageSqlBinding = [currentUserId, targetUserId];
  const [messageResult] = await pool.query(messageSql, messageSqlBinding);
  const messageId = messageResult.insertId;
  const contentSql = `INSERT INTO message_content (message_id, type, content) VALUES (?, ?, ?)`;
  const contentSqlBinding = [messageId, "text", content];
  const [result] = await pool.query(contentSql, contentSqlBinding);
  return result;
};

module.exports = { getMessages, saveMessages };
