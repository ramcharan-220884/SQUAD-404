import { pool } from "./config/db.js";

async function runMigration() {
  try {
    console.log("Checking columns in notifications table...");
    const [columns] = await pool.query("DESCRIBE notifications");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('is_read')) {
      console.log("Adding is_read column...");
      await pool.query("ALTER TABLE notifications ADD COLUMN is_read TINYINT(1) DEFAULT 0 AFTER type");
    } else {
      console.log("is_read column already exists.");
    }

    if (!columnNames.includes('job_id')) {
      console.log("Adding job_id column...");
      await pool.query("ALTER TABLE notifications ADD COLUMN job_id INT(11) DEFAULT NULL AFTER is_read");
    } else {
      console.log("job_id column already exists.");
    }

    console.log("Migration successful.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

runMigration();
