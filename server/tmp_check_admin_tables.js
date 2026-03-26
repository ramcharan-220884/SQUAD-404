import { pool } from "./config/db.js";

async function checkAdminTables() {
  const tablesToCheck = [
    "students",
    "companies",
    "applications",
    "jobs",
    "events",
    "competitions",
    "student_resources",
    "admin_settings",
    "application_rounds"
  ];
  
  for (const table of tablesToCheck) {
    try {
      const [columns] = await pool.query(`DESCRIBE ${table}`);
      console.log(`Table: ${table}`);
      console.log(columns.map(c => c.Field).join(", "));
    } catch (err) {
      console.error(`Error checking table ${table}: ${err.message}`);
    }
  }
  process.exit(0);
}

checkAdminTables();
