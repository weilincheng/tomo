const { pool } = require("./mysql_connection");

const getMessages = async (receiverUserId, senderUserId) => {
  let sql = `SELECT m.sender_user_id, m.receiver_user_id, m.created_at, mc.type, mc.content FROM messages AS m inner join message_content AS mc ON m.id = mc.message_id`,
    sqlBindings,
    sqlWhereCondition = ``,
    sqlLimitCondition = `ORDER BY m.created_at DESC LIMIT 20`;
  if (senderUserId === "all") {
    sqlWhereCondition = `WHERE receiver_user_id = ?`;
    sqlBindings = [receiverUserId];
  } else {
    sqlWhereCondition = `WHERE (sender_user_id = ? AND receiver_user_id = ? ) OR (sender_user_id = ? AND receiver_user_id = ? )`;
    sqlBindings = [receiverUserId, senderUserId, senderUserId, receiverUserId];
  }
  const [result] = await pool.query(
    `${sql} ${sqlWhereCondition} ${sqlLimitCondition}`,
    sqlBindings
  );
  return result;
};
module.exports = { getMessages };
