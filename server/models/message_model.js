const { pool } = require("./mysql_connection");

const getMessages = async (currentUserId, targetUserId) => {
  const sqlLimitCondition = `ORDER BY created_at DESC LIMIT 100`;
  if (targetUserId === "all") {
    const sql1 = `SELECT u.nickname, u.profile_image, m.sender_user_id, m.receiver_user_id, m.created_at, mc.type, mc.content FROM messages AS m INNER JOIN message_content AS mc INNER JOIN users AS u ON m.id = mc.message_id AND m.sender_user_id = u.id`;
    const sqlWhereCondition1 = `WHERE receiver_user_id = ?`;
    const sql2 = `SELECT u.nickname, u.profile_image, m.sender_user_id, m.receiver_user_id, m.created_at, mc.type, mc.content FROM messages AS m INNER JOIN message_content AS mc INNER JOIN users AS u ON m.id = mc.message_id AND m.receiver_user_id = u.id`;
    const sqlWhereCondition2 = `WHERE sender_user_id = ?`;
    const sqlBindings = [currentUserId, currentUserId];
    const [result] = await pool.query(
      `${sql1} ${sqlWhereCondition1} UNION ${sql2} ${sqlWhereCondition2} ${sqlLimitCondition}`,
      sqlBindings
    );
    return result;
  } else {
    const sql = `SELECT m.sender_user_id, m.receiver_user_id, m.created_at, mc.type, mc.content FROM messages AS m INNER JOIN message_content AS mc ON m.id = mc.message_id`;
    const sqlWhereCondition = `WHERE (sender_user_id = ? AND receiver_user_id = ? ) OR (sender_user_id = ? AND receiver_user_id = ? )`;
    const sqlBindings = [
      currentUserId,
      targetUserId,
      targetUserId,
      currentUserId,
    ];
    const [result] = await pool.query(
      `${sql} ${sqlWhereCondition} ${sqlLimitCondition}`,
      sqlBindings
    );
    return result;
  }
};

const saveMessages = async (currentUserId, targetUserId, content, type) => {
  const messageSql = `INSERT INTO messages (sender_user_id, receiver_user_id) VALUES (?, ?)`;
  const messageSqlBinding = [currentUserId, targetUserId];
  const [messageResult] = await pool.query(messageSql, messageSqlBinding);
  const messageId = messageResult.insertId;
  const contentSql = `INSERT INTO message_content (message_id, type, content) VALUES (?, ?, ?)`;
  const contentSqlBinding = [messageId, type, content];
  const [result] = await pool.query(contentSql, contentSqlBinding);
  return result;
};

module.exports = { getMessages, saveMessages };
