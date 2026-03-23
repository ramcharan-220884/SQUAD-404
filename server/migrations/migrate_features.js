import { pool } from "../config/db.js";

async function createFeatureTables() {
  try {
    console.log("Creating database tables for placeholder features...");

    // Events Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150),
        date DATE,
        type VARCHAR(50),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Competitions Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS competitions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150),
        deadline DATE,
        prize VARCHAR(100),
        status VARCHAR(50) DEFAULT 'Open',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Interviews Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT,
        company VARCHAR(150),
        role VARCHAR(150),
        round VARCHAR(100),
        date DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Assessments Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150),
        duration INT,
        deadline DATE,
        status VARCHAR(50) DEFAULT 'Active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Tables created successfully. Inserting generic data if empty...");

    // Insert dummy data only if empty to give the pages immediate live data
    const [events] = await pool.query("SELECT id FROM events LIMIT 1");
    if (events.length === 0) {
      await pool.query(`INSERT INTO events (title, date, type, description) VALUES 
        ('Global Tech Summit', '2026-10-15', 'Seminar', 'Join industry leaders for an insightful session on AI.'),
        ('Resume Workshop', '2026-06-20', 'Workshop', 'Learn how to pass ATS screening.')
      `);
    }

    const [comps] = await pool.query("SELECT id FROM competitions LIMIT 1");
    if (comps.length === 0) {
      await pool.query(`INSERT INTO competitions (title, deadline, prize, status) VALUES 
        ('HackTheFuture', '2026-08-01', '$10,000 + Job Offer', 'Open'),
        ('AlgoMasters', '2026-05-15', 'MacBook Pro', 'Open')
      `);
    }

    const [ass] = await pool.query("SELECT id FROM assessments LIMIT 1");
    if (ass.length === 0) {
      await pool.query(`INSERT INTO assessments (title, duration, deadline) VALUES 
        ('General Aptitude Test 1', 60, '2026-05-30'),
        ('Coding Round - Data Structures', 90, '2026-06-10')
      `);
    }

    console.log("Migration finished.");
    process.exit(0);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

createFeatureTables();
