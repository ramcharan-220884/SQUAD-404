import { pool } from "./config/db.js";
import bcrypt from "bcrypt";

async function addColumnIfNotExists(table, column, definition) {
  try {
    const [rows] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
    if (rows.length === 0) {
      await pool.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
      console.log(`✅ Added column ${column} to ${table}.`);
    } else {
      console.log(`⏭️  Column ${column} already exists in ${table}.`);
    }
  } catch (err) {
    if (err.code === 'ER_NO_SUCH_TABLE') {
      // Table will be created by CREATE TABLE IF NOT EXISTS later or before
    } else {
      console.error(`❌ Error adding column ${column} to ${table}:`, err.message);
    }
  }
}

async function renameColumnIfExists(table, oldCol, newCol, definition) {
  try {
    const [rows] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [oldCol]);
    if (rows.length > 0) {
      // First check if newCol already exists
      const [newRows] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [newCol]);
      if (newRows.length === 0) {
        try {
            // MySQL 8+ syntax
            await pool.query(`ALTER TABLE ${table} RENAME COLUMN ${oldCol} TO ${newCol}`);
        } catch (e) {
            // Fallback for older MySQL (requires definition)
            await pool.query(`ALTER TABLE ${table} CHANGE COLUMN ${oldCol} ${newCol} ${definition}`);
        }
        console.log(`✅ Renamed ${oldCol} to ${newCol} in ${table}.`);
      } else {
        console.log(`⏭️  Cannot rename ${oldCol}: ${newCol} already exists in ${table}.`);
      }
    }
  } catch (err) {
    if (err.code !== 'ER_NO_SUCH_TABLE') {
        console.error(`❌ Error renaming ${oldCol} in ${table}:`, err.message);
    }
  }
}

async function finalMigration() {
  console.log("🚀 Starting Final Production Migration...");

  // 1. Ensure tables exist first
  const createStatements = [
    {
      desc: "students table",
      sql: `CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      desc: "companies table",
      sql: `CREATE TABLE IF NOT EXISTS companies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      desc: "applications table",
      sql: `CREATE TABLE IF NOT EXISTS applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        company_id INT NOT NULL,
        status ENUM('Applied', 'Shortlisted', 'Rejected', 'Selected') DEFAULT 'Applied',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      desc: "announcements table",
      sql: `CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      desc: "support_tickets table",
      sql: `CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    },
    {
      desc: "settings table",
      sql: `CREATE TABLE IF NOT EXISTS settings (
        id INT PRIMARY KEY DEFAULT 1,
        system_name VARCHAR(255) DEFAULT 'EDUVATE Placement Portal'
      )`
    },
    {
      desc: "admins table",
      sql: `CREATE TABLE IF NOT EXISTS admins (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    }
  ];

  for (const { desc, sql } of createStatements) {
    await pool.query(sql);
    console.log(`✅ ${desc} ensured.`);
  }

  // 1.5 Standardize Primary Keys (Renaming legacy columns)
  await renameColumnIfExists("students", "user_id", "id", "INT AUTO_INCREMENT");
  await renameColumnIfExists("companies", "company_id", "id", "INT AUTO_INCREMENT");
  await renameColumnIfExists("jobs", "job_id", "id", "INT AUTO_INCREMENT");
  await renameColumnIfExists("applications", "application_id", "id", "INT AUTO_INCREMENT");
  await renameColumnIfExists("support_tickets", "ticket_id", "id", "INT AUTO_INCREMENT");
  await renameColumnIfExists("announcements", "announcement_id", "id", "INT AUTO_INCREMENT");
  await renameColumnIfExists("admins", "admin_id", "id", "INT AUTO_INCREMENT");

  console.log('--- Migration Finished Successfully ---');

  // 2. Add/Correct columns for each table
  await addColumnIfNotExists("students", "first_name", "VARCHAR(100)");
  await addColumnIfNotExists("students", "last_name", "VARCHAR(100)");
  await addColumnIfNotExists("students", "dob", "DATE");
  await addColumnIfNotExists("students", "gender", "VARCHAR(20)");
  await addColumnIfNotExists("students", "college", "VARCHAR(200)");
  await addColumnIfNotExists("students", "degree", "VARCHAR(100)");
  await addColumnIfNotExists("students", "skills", "TEXT");
  await addColumnIfNotExists("students", "projects", "TEXT");
  await addColumnIfNotExists("students", "internships", "TEXT");
  await addColumnIfNotExists("students", "profile_photo_url", "VARCHAR(500)");
  await addColumnIfNotExists("students", "profile_completed", "BOOLEAN DEFAULT FALSE");
  await addColumnIfNotExists("students", "branch", "VARCHAR(100)");
  await addColumnIfNotExists("students", "cgpa", "DECIMAL(4,2)");
  await addColumnIfNotExists("students", "resume_url", "VARCHAR(500)");
  await addColumnIfNotExists("students", "placed_status", "ENUM('Unplaced', 'Placed') DEFAULT 'Unplaced'");
  await addColumnIfNotExists("students", "approved", "BOOLEAN DEFAULT FALSE");
  await addColumnIfNotExists("students", "status", "ENUM('Pending', 'Active', 'Rejected') DEFAULT 'Pending'");
  await addColumnIfNotExists("students", "dark_mode", "BOOLEAN DEFAULT FALSE");

  await addColumnIfNotExists("companies", "approved", "BOOLEAN DEFAULT FALSE");
  await addColumnIfNotExists("companies", "status", "ENUM('Pending', 'Active', 'Rejected') DEFAULT 'Pending'");
  await addColumnIfNotExists("companies", "role", "VARCHAR(100)");
  await addColumnIfNotExists("companies", "package", "VARCHAR(100)");
  await addColumnIfNotExists("companies", "eligibility_cgpa", "DECIMAL(4,2)");
  await addColumnIfNotExists("companies", "deadline", "DATE");
  await addColumnIfNotExists("companies", "description", "TEXT");
  await addColumnIfNotExists("companies", "dark_mode", "BOOLEAN DEFAULT FALSE");

  await addColumnIfNotExists("support_tickets", "role", "ENUM('student', 'company') DEFAULT 'student'");
  await addColumnIfNotExists("support_tickets", "priority", "ENUM('Low', 'Normal', 'High', 'Urgent') DEFAULT 'Normal'");
  await addColumnIfNotExists("support_tickets", "status", "ENUM('Open', 'In Progress', 'Resolved') DEFAULT 'Open'");

  await addColumnIfNotExists("announcements", "category", "VARCHAR(50) DEFAULT 'Notice'");
  await addColumnIfNotExists("announcements", "audience", "VARCHAR(100) DEFAULT 'All Students'");
  await addColumnIfNotExists("announcements", "start_date", "DATE");
  await addColumnIfNotExists("announcements", "expiry_date", "DATE");
  await addColumnIfNotExists("announcements", "is_pinned", "BOOLEAN DEFAULT FALSE");

  await addColumnIfNotExists("settings", "academic_year", "VARCHAR(50)");
  await addColumnIfNotExists("settings", "semester", "VARCHAR(50)");
  await addColumnIfNotExists("settings", "placement_season", "VARCHAR(50)");
  await addColumnIfNotExists("students", "password", "VARCHAR(255) NOT NULL");
  await addColumnIfNotExists("companies", "password", "VARCHAR(255) NOT NULL");
  await addColumnIfNotExists("admins", "password", "VARCHAR(255) NOT NULL");
  await addColumnIfNotExists("admins", "dark_mode", "BOOLEAN DEFAULT FALSE");

  // Remove legacy columns if they exist to clean up
  const cleanup = [
    { table: "admins", col: "password_hash" },
    { table: "students", col: "password_hash" },
    { table: "companies", col: "password_hash" },
  ];

  for (const { table, col } of cleanup) {
    try {
      const [rows] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [col]);
      if (rows.length > 0) {
        await pool.query(`ALTER TABLE ${table} DROP COLUMN ${col}`);
        console.log(`🗑️ Removed legacy column ${col} from ${table}.`);
      }
    } catch (err) {
      // Ignore errors if table/col doesn't exist
    }
  }

  // 3. Finalize data
  try {
    await pool.query("INSERT IGNORE INTO settings (id, system_name, academic_year, semester, placement_season) VALUES (1, 'EDUVATE Placement Portal', '2024-2025', 'Even', 'Active')");
    console.log("✅ Default settings initialized.");
  } catch (err) {
    console.error("❌ Error initializing settings:", err.message);
  }

  try {
    const [existing] = await pool.query("SELECT * FROM admins WHERE email = 'admin@pms.com'");
    if (existing.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await pool.query("INSERT INTO admins (name, email, password) VALUES (?, ?, ?)", ["System Admin", "admin@pms.com", hashedPassword]);
      console.log("✅ Default admin created (admin@pms.com / admin123)");
    } else {
      console.log("⏭️  Admin already exists.");
    }
  } catch (err) {
    console.error("❌ Error creating default admin:", err.message);
  }

  console.log("🏁 Migration Complete.");
  process.exit(0);
}

finalMigration();
