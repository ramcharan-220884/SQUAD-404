import { pool } from "../config/db.js";

async function migrate() {
  const statements = [
    // Students missing fields
    { desc: "branch to students", sql: "ALTER TABLE students ADD COLUMN branch VARCHAR(255);" },
    { desc: "backlogs to students", sql: "ALTER TABLE students ADD COLUMN backlogs INT DEFAULT 0;" },

    // Applications table
    { desc: "status to applications", sql: "ALTER TABLE applications MODIFY COLUMN status ENUM('Applied', 'Shortlisted', 'Rejected', 'Selected') DEFAULT 'Applied';" },
    { desc: "resume_url to applications", sql: "ALTER TABLE applications ADD COLUMN resume_url VARCHAR(500);" },
    
    // Add missing columns to jobs table
    { desc: "eligible_branches to jobs", sql: "ALTER TABLE jobs ADD COLUMN eligible_branches JSON;" },
    { desc: "allowed_backlogs to jobs", sql: "ALTER TABLE jobs ADD COLUMN allowed_backlogs INT DEFAULT 0;" },
    { desc: "min_cgpa to jobs", sql: "ALTER TABLE jobs ADD COLUMN min_cgpa DECIMAL(4,2) DEFAULT 0.00;" },
  ];

  console.log("Starting Phase 2 migrations...\n");

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

  console.log("\nPhase 2 Migration complete.");
  process.exit(0);
}

migrate();
