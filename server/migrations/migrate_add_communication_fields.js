import { pool } from "../config/db.js";

async function migrateCommunicationFields() {
  console.log("🚀 Starting migration for Candidate Communication System...");

  try {
    // 1. Add phone column to students
    try {
      await pool.query("ALTER TABLE students ADD COLUMN phone VARCHAR(20);");
      console.log("✅ Added 'phone' column to 'students' table.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.message.includes("Duplicate column")) {
        console.log("⏭️  'phone' column already exists in 'students'.");
      } else {
        console.error("❌ Error adding 'phone' column:", e.message);
      }
    }

    // 2. Create notifications table
    try {
      const createNotifications = `
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          type VARCHAR(50) NOT NULL,
          message TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await pool.query(createNotifications);
      console.log("✅ Ensured 'notifications' table exists.");
    } catch (e) {
      console.error("❌ Error creating 'notifications' table:", e.message);
    }

    console.log("🏁 Migration Complete.");
  } catch (err) {
    console.error("Migration failed critically:", err);
  } finally {
    process.exit(0);
  }
}

migrateCommunicationFields();
