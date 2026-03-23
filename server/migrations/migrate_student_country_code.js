import { pool } from "../config/db.js";

async function migrateStudentPhone() {
  console.log("🚀 Starting migration for country_code...");

  try {
    try {
      await pool.query("ALTER TABLE students ADD COLUMN country_code VARCHAR(5) DEFAULT '+91';");
      console.log("✅ Added 'country_code' column to 'students' table.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.message.includes("Duplicate column")) {
        console.log("⏭️  'country_code' column already exists in 'students'.");
      } else {
        console.error("❌ Error adding 'country_code' column:", e.message);
      }
    }
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    process.exit(0);
  }
}

migrateStudentPhone();
