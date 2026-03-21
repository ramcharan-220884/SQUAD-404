import { pool } from './config/db.js';

async function runMigration() {
  try {
    console.log("Creating admin_settings table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id INT PRIMARY KEY AUTO_INCREMENT,
        system_name VARCHAR(255),
        college_name VARCHAR(255),
        admin_email VARCHAR(255),
        contact_number VARCHAR(20),
        academic_year VARCHAR(50),
        semester VARCHAR(20),
        placement_season VARCHAR(50),
        dark_mode BOOLEAN DEFAULT false,
        notifications JSON,
        permissions JSON,
        session_timeout INT,
        two_factor_enabled BOOLEAN DEFAULT false,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log("Inserting default row if it doesn't exist...");
    await pool.query(`
      INSERT IGNORE INTO admin_settings 
      (id, system_name, college_name, admin_email, contact_number, academic_year, semester, placement_season, session_timeout, notifications, permissions) 
      VALUES (
        1, 'EDUVATE Portal', 'National Institute of Technology', 'admin@nit.edu', '+91-800-226-7871', '2024 – 2025', 'Even Semester', 'Active', 30,
        JSON_OBJECT('email', true, 'placement', true, 'events', false, 'dashboard', true),
        JSON_OBJECT('manageStudents', true, 'manageCompanies', true, 'postAnnouncements', true, 'manageDrives', false)
      )
    `);

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

runMigration();
