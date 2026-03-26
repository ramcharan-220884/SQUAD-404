import { pool } from "./config/db.js";

async function checkColumns() {
  try {
    const [rows] = await pool.query("DESCRIBE notifications");
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkColumns();
