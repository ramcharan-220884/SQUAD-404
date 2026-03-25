import { pool } from "./config/db.js";

async function test() {
  try {
    const [rows] = await pool.query("SELECT 1 as val");
    console.log("DB connected successfully:", rows);
    process.exit(0);
  } catch(e) {
    console.error("DB connection error:", e.message);
    process.exit(1);
  }
}
test();
