import { pool } from './config/db.js';

async function run() {
  try {
    await pool.query("ALTER TABLE students CHANGE COLUMN status status ENUM('Pending','Active','Rejected') DEFAULT 'Pending'");
    console.log("students table altered.");
  } catch(e) { console.error(e) }

  try {
    await pool.query("ALTER TABLE companies CHANGE COLUMN status status ENUM('Pending','Active','Rejected','Blocked') DEFAULT 'Pending'");
    console.log("companies table altered.");
  } catch(e) { console.error(e) }
  
  process.exit(0);
}
run();
