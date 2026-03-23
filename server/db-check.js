import { pool } from "./config/db.js";

async function checkUsers() {
  try {
    const roles = ["admins", "students", "companies"];
    for (const role of roles) {
      const [rows] = await pool.query(`SELECT id, email, name FROM ${role} LIMIT 5`);
      console.log(`--- ${role.toUpperCase()} ---`);
      if (rows.length === 0) {
        console.log("No users found.");
      } else {
        rows.forEach(r => console.log(`${r.id}: ${r.email} (${r.name})`));
      }
    }
    process.exit(0);
  } catch (err) {
    console.error("Database check failed:", err.message);
    process.exit(1);
  }
}

checkUsers();
