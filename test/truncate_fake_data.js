const { pool } = require("../server/models/mysql_connection");

const truncateFakeData = async () => {
  const tables = [
    "blocklist",
    "interests",
    "message_content",
    "messages",
    "notification_content",
    "notifications",
    "post_images",
    "posts",
    "relationships",
    "user_interests",
    "users",
  ];
  for (const table of tables) {
    await truncateTable(table);
  }
};

const truncateTable = async (table) => {
  const db = await pool.getConnection();
  await db.query("START TRANSACTION");
  await db.query("SET FOREIGN_KEY_CHECKS = ?", 0);
  await db.query(`TRUNCATE TABLE ${table}`);
  await db.query("SET FOREIGN_KEY_CHECKS = ?", 1);
  await db.query("COMMIT");
  await db.release();
  return;
};

module.exports = { truncateFakeData, truncateTable };
