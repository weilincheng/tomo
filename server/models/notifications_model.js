const { pool } = require("./mysql_connection");

const getNotifications = async (userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [result] = await conn.query(
      "SELECT n.has_read, c.type, n.created_at, c.content, u.nickname AS sender_nickname, u.id AS sender_user_id, u.profile_image FROM notifications AS n INNER JOIN notification_content as c ON n.id = c.notification_id INNER JOIN users as u ON u.id = n.sender_user_Id WHERE receiver_user_id = ? ORDER BY n.id DESC",
      [userId]
    );
    await conn.query(
      "UPDATE notifications SET has_read = true WHERE receiver_user_id = ?",
      [userId]
    );
    await conn.query("COMMIT");
    return result;
  } catch (error) {
    await conn.query("ROLLBACK");
    return { error: "Something went wrong" };
  } finally {
    conn.release();
  }
};

const addNotification = async (
  receiver_user_id,
  sender_user_id,
  type,
  content
) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    const [notification] = await conn.query(
      "INSERT INTO notifications (receiver_user_id, sender_user_id ) VALUES (?, ?)",
      [receiver_user_id, sender_user_id]
    );
    const notificationId = notification.insertId;
    await conn.query(
      "INSERT INTO notification_content (notification_id, type, content) VALUES (?, ?, ?)",
      [notificationId, type, content]
    );
    await conn.query("COMMIT");
  } catch (error) {
    await conn.query("ROLLBACK");
  } finally {
    conn.release();
  }
};

module.exports = { getNotifications, addNotification };
