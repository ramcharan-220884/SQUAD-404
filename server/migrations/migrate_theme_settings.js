import { pool } from './config/db.js';

async function runMigration() {
  try {
    console.log("Adding dark_mode column if it doesn't exist...");

    const tables = ['students', 'companies', 'admins'];

    for (const table of tables) {
      try {
        await pool.query(`ALTER TABLE ${table} ADD COLUMN dark_mode BOOLEAN DEFAULT false`);
        console.log(`Added dark_mode to ${table}`);
      } catch (err) {
        // Error code 1060 is ER_DUP_FIELDNAME (Duplicate column name)
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log(`Column dark_mode already exists in ${table}`);
        } else {
          console.error(`Error adding to ${table}:`, err.message);
        }
      }
    }

    console.log("Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

runMigration();
