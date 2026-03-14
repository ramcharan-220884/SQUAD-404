import { pool } from "./config/db.js";

async function migrate() {
  const alterations = [
    { desc: "first_name to students", sql: "ALTER TABLE students ADD COLUMN first_name VARCHAR(100);" },
    { desc: "last_name to students", sql: "ALTER TABLE students ADD COLUMN last_name VARCHAR(100);" },
    { desc: "dob to students", sql: "ALTER TABLE students ADD COLUMN dob DATE;" },
    { desc: "gender to students", sql: "ALTER TABLE students ADD COLUMN gender VARCHAR(20);" },
    { desc: "college to students", sql: "ALTER TABLE students ADD COLUMN college VARCHAR(200);" },
    { desc: "degree to students", sql: "ALTER TABLE students ADD COLUMN degree VARCHAR(100);" },
    { desc: "profile_photo_url to students", sql: "ALTER TABLE students ADD COLUMN profile_photo_url VARCHAR(500);" },
  ];

  console.log("Starting migration — adding student profile fields...\n");

  for (const { desc, sql } of alterations) {
    try {
      await pool.query(sql);
      console.log(`✅ Added ${desc}`);
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME" || e.message.includes("Duplicate column")) {
        console.log(`⏭️  Column already exists: ${desc}`);
      } else {
        console.error(`❌ Error adding ${desc}:`, e.message);
      }
    }
  }

  console.log("\nMigration complete.");
  process.exit(0);
}

migrate();
