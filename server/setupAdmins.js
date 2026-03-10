import { pool } from "./config/db.js";
import bcrypt from "bcrypt";

async function setup() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        admin_id INT(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        status ENUM('Active','Blocked') DEFAULT 'Active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    console.log("Admins table created.");

    // Insert a default admin
    const hash = await bcrypt.hash("admin123", 10);
    await pool.query(
      "INSERT IGNORE INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
      ["Super Admin", "admin@pms.com", hash]
    );
    console.log("Default admin inserted");

    process.exit(0);
  } catch (err) {
    console.error("Error setting up admins table:", err);
    process.exit(1);
  }
}

setup();
