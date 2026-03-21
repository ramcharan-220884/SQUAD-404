import { pool } from "./config/db.js";

async function checkJobsCols() {
  try {
    const [rows] = await pool.query("SHOW COLUMNS FROM jobs");
    console.log("COLUMNS IN JOBS TABLE:");
    rows.forEach(r => console.log(`- ${r.Field} (${r.Type})`));
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}
checkJobsCols();
