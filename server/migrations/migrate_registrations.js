import mysql from "mysql2";
import dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve("./.env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }
}).promise();

async function runMigration() {
  try {
    console.log("Connecting to:", process.env.DB_HOST);
    await pool.query("SELECT 1");
    console.log("Connected successfully. Creating registration tables...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS competition_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        competition_id INT NOT NULL,
        student_id INT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_registration (competition_id, student_id),
        FOREIGN KEY (competition_id) REFERENCES competitions(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        student_id INT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_registration (event_id, student_id),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessment_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT NOT NULL,
        student_id INT NOT NULL,
        score INT DEFAULT NULL,
        status ENUM('Started', 'Completed') DEFAULT 'Started',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        UNIQUE KEY unique_attempt (assessment_id, student_id),
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `);

    console.log("Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runMigration();
