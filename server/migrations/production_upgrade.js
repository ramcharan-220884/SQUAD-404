import { pool } from "../config/db.js";

async function migrate() {
  const statements = [
    // Students
    { desc: "skills to students", sql: "ALTER TABLE students ADD COLUMN skills JSON;" },
    { desc: "projects to students", sql: "ALTER TABLE students ADD COLUMN projects JSON;" },
    { desc: "resume_url to students", sql: "ALTER TABLE students ADD COLUMN resume_url VARCHAR(500);" },
    { desc: "cgpa to students", sql: "ALTER TABLE students ADD COLUMN cgpa DECIMAL(4,2);" },
    { desc: "first_name to students", sql: "ALTER TABLE students ADD COLUMN first_name VARCHAR(100);" },
    { desc: "last_name to students", sql: "ALTER TABLE students ADD COLUMN last_name VARCHAR(100);" },
    { desc: "dob to students", sql: "ALTER TABLE students ADD COLUMN dob DATE;" },
    { desc: "gender to students", sql: "ALTER TABLE students ADD COLUMN gender VARCHAR(20);" },
    { desc: "college to students", sql: "ALTER TABLE students ADD COLUMN college VARCHAR(200);" },
    { desc: "degree to students", sql: "ALTER TABLE students ADD COLUMN degree VARCHAR(100);" },
    { desc: "profile_photo_url to students", sql: "ALTER TABLE students ADD COLUMN profile_photo_url VARCHAR(500);" },

    // Jobs
    { desc: "department to jobs", sql: "ALTER TABLE jobs ADD COLUMN department VARCHAR(100);" },
    { desc: "deadline to jobs", sql: "ALTER TABLE jobs ADD COLUMN deadline DATE;" },
    
    // Announcements
    { desc: "table announcements", sql: `CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        audience VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );` },

    // Settings
    { desc: "table settings", sql: `CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        system_name VARCHAR(255) DEFAULT 'EDUVATE Portal',
        college_name VARCHAR(255) DEFAULT 'National Institute of Technology',
        admin_email VARCHAR(255) DEFAULT 'admin@nit.edu',
        contact_number VARCHAR(50) DEFAULT '+91-800-226-7871',
        notifications_config JSON,
        permissions_config JSON
      );` },

    // Initial setting insert (if empty)
    { desc: "default settings row", sql: `INSERT INTO settings (system_name) 
        SELECT 'EDUVATE Portal' FROM DUAL WHERE NOT EXISTS (SELECT * FROM settings);` },

    // Support Tickets
    { desc: "table support_tickets", sql: `CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        attachment_url VARCHAR(500),
        reporter_id INT,
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );` },

    // Indexes
    { desc: "idx_jobs_company", sql: "CREATE INDEX idx_jobs_company ON jobs(company_id);" },
    { desc: "idx_apps_job", sql: "CREATE INDEX idx_apps_job ON applications(job_id);" },
    { desc: "idx_apps_student", sql: "CREATE INDEX idx_apps_student ON applications(student_id);" },
  ];

  console.log("Starting production upgrade migration...\n");

  for (const { desc, sql } of statements) {
    try {
      await pool.query(sql);
      console.log(`✅ Success: ${desc}`);
    } catch (e) {
      if (
        e.code === "ER_DUP_FIELDNAME" || 
        e.message.includes("Duplicate column") ||
        e.code === "ER_DUP_KEYNAME" ||
        e.message.includes("Duplicate key name")
      ) {
        console.log(`⏭️  Already exists: ${desc}`);
      } else {
        console.error(`❌ Error on ${desc}:`, e.message);
      }
    }
  }

  console.log("\nMigration complete.");
  process.exit(0);
}

migrate();
