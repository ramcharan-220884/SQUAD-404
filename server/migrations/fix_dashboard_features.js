import { pool } from "../config/db.js";

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
    console.error(`❌ Error adding column ${column} to ${table}:`, err.message);
  }
}

async function runSchemaFix() {
  console.log("🛠️ Starting Dashboard Features Schema Fix Migration...");

  try {
    // 1. Add description columns
    await addColumnIfNotExists("competitions", "description", "TEXT");
    await addColumnIfNotExists("assessments", "description", "TEXT");

    // 2. Add event registrations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_id INT NOT NULL,
        student_id INT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_event_student (event_id, student_id)
      )
    `);
    console.log(`✅ Ensured event_registrations table exists.`);

    // 3. Add competition registrations
    await pool.query(`
      CREATE TABLE IF NOT EXISTS competition_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        competition_id INT NOT NULL,
        student_id INT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_comp_student (competition_id, student_id)
      )
    `);
    console.log(`✅ Ensured competition_registrations table exists.`);

    // 4. Add assessment attempts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessment_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT NOT NULL,
        student_id INT NOT NULL,
        score DECIMAL(5,2),
        status VARCHAR(50) DEFAULT 'Started',
        evaluation_status VARCHAR(50) DEFAULT 'Pending',
        completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_ass_student (assessment_id, student_id)
      )
    `);
    console.log(`✅ Ensured assessment_attempts table exists.`);

    console.log("🏁 Schema Fix Migration Complete.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  }
}

runSchemaFix();
