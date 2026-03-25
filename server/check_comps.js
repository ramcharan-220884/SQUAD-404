import { pool } from "./config/db.js";
import fs from "fs";

async function check() {
  try {
    const [rows] = await pool.query("DESCRIBE competitions");
    const [regs] = await pool.query("DESCRIBE competition_registrations");
    
    const output = {
      competitions: rows,
      registrations: regs
    };
    
    fs.writeFileSync("table_structure.json", JSON.stringify(output, null, 2));
    console.log("Output written to table_structure.json");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
