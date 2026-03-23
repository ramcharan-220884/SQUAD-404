import { pool } from '../config/db.js';

const runUpdates = async () => {
  try {
    console.log("Starting DB update...");
    
    // Add application_code to applications if not exists
    try {
      await pool.query('ALTER TABLE applications ADD COLUMN application_code VARCHAR(50) UNIQUE');
      console.log("- Added application_code to applications");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log("- application_code already exists, skipping");
      else throw e;
    }

    // Add phone to students if not exists
    try {
      await pool.query('ALTER TABLE students ADD COLUMN phone VARCHAR(20) DEFAULT NULL');
      console.log("- Added phone to students");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log("- phone already exists, skipping");
      else throw e;
    }

    // Add country_code to students if not exists
    try {
      await pool.query('ALTER TABLE students ADD COLUMN country_code VARCHAR(10) DEFAULT NULL');
      console.log("- Added country_code to students");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') console.log("- country_code already exists, skipping");
      else throw e;
    }

    // Create application_rounds table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS application_rounds (
        id INT AUTO_INCREMENT PRIMARY KEY,
        application_id INT,
        round_name VARCHAR(100),
        status ENUM('Scheduled', 'Completed', 'Passed', 'Failed') DEFAULT 'Scheduled',
        date DATE,
        time TIME,
        location VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id) ON DELETE CASCADE
      )
    `);
    console.log("- Created application_rounds table");

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        type VARCHAR(50),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);
    console.log("- Created notifications table");

    console.log("DB update completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error running DB update:", err);
    process.exit(1);
  }
};

runUpdates();
