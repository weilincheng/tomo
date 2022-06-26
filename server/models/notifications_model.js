const { pool } = require("./mysql_connection");

const getNotifications = async (userId) => {
  const conn = await pool.getConnection();
  try {
    await conn.query("START TRANSACTION");
    await conn.query(
      "SELECT * FROM notifications AS n INNER JOIN notification_content as c ON n.id = c.notification_id WHERE receiver_id = ?",
      [userId]
    );
    await conn.query(
      "UPDATE notifications SET read = 'true' WHERE receiver_id = ?",
      [userId]
    );
    await conn.query("COMMIT");
    return true;
  } catch (error) {
    await conn.query("ROLLBACK");
    return false;
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
    const notification = await conn.query(
      "INSERT INTO notifications (receiver_user_id, sender_user_id ) VALUES (?, ?)",
      [receiver_user_id, sender_user_id]
    );
    const notificationId = notification.insertId;
    await conn.query(
      "INSERT INTO notification_content (notification_id, type, content) VALUES (?, ?, ?)",
      [notificationId, type, content]
    );
    await conn.query("COMMIT");
    return true;
  } catch (error) {
    await conn.query("ROLLBACK");
    return false;
  } finally {
    conn.release();
  }
};

module.exports = { getNotifications, addNotification };
