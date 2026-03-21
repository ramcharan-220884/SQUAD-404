import { pool } from "../config/db.js";

async function migrate() {
  const statements = [
    { desc: "location to jobs", sql: "ALTER TABLE jobs ADD COLUMN location VARCHAR(255);" },
    { desc: "type to jobs", sql: "ALTER TABLE jobs ADD COLUMN type VARCHAR(50);" },
    { desc: "skills to jobs", sql: "ALTER TABLE jobs ADD COLUMN skills VARCHAR(500);" },
    { desc: "experience to jobs", sql: "ALTER TABLE jobs ADD COLUMN experience VARCHAR(100);" },
  ];

  console.log("Starting Phase 3 migrations...\n");

  for (const { desc, sql } of statements) {
    try {
      await pool.query(sql);
      console.log(`✅ Success: ${desc}`);
    } catch (e) {
      if (
        e.code === "ER_DUP_FIELDNAME" || 
        e.message.includes("Duplicate column")
      ) {
        console.log(`⏭️  Already exists: ${desc}`);
      } else {
        console.error(`❌ Error on ${desc}:`, e.message);
      }
    }
  }

  console.log("\nPhase 3 Migration complete.");
  process.exit(0);
}

migrate();
