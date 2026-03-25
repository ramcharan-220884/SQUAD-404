import { pool } from "./config/db.js";
async function run() {
  try {
    const [res] = await pool.query("UPDATE competitions SET date = '2026-12-31' WHERE title LIKE '%Hackanomics%'");
    console.log("SUCCESS:", res);
  } catch(e) {
    console.error("SQL ERROR:", e.message);
  }
  process.exit(0);
}
run();
