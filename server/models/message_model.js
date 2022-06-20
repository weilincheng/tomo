const { pool } = require("./mysql_connection");

const getMessages = async (receiverUserId, senderUserId) => {
  const sql = `SELECT m.sender_user_id, m.receiver_user_id, m.created_at, mc.type, mc.content FROM messages AS m inner join message_content AS mc ON m.id = mc.message_id WHERE (sender_user_id = ? AND receiver_user_id = ? ) OR (sender_user_id = ? AND receiver_user_id = ? ) ORDER BY m.created_at DESC LIMIT 20`;
  const sqlBindings = [
    receiverUserId,
    senderUserId,
    senderUserId,
    receiverUserId,
  ];
  const [result] = await pool.query(sql, sqlBindings);
  return result;
};
module.exports = { getMessages };
