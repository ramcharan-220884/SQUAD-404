import { pool } from "../config/db.js";

async function migrate() {
  try {
    console.log("Starting competition table migration...");

    // 1. Rename deadline to date if deadline exists
    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM competitions LIKE 'deadline'");
      if (cols.length > 0) {
        await pool.query("ALTER TABLE competitions CHANGE COLUMN deadline date DATE");
        console.log("✅ Renamed deadline to date");
      }
    } catch (e) { console.log("⏭️ deadline already renamed or missing"); }

    // 2. Add category if missing
    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM competitions LIKE 'category'");
      if (cols.length === 0) {
        await pool.query("ALTER TABLE competitions ADD COLUMN category VARCHAR(100) AFTER title");
        console.log("✅ Added category column");
      }
    } catch (e) { console.error(e); }

    // 3. Add registrationLink if missing
    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM competitions LIKE 'registrationLink'");
      if (cols.length === 0) {
        await pool.query("ALTER TABLE competitions ADD COLUMN registrationLink VARCHAR(255) AFTER category");
        console.log("✅ Added registrationLink column");
      }
    } catch (e) { console.error(e); }

    // 4. Update status to ENUM
    try {
      // First ensure all current statuses are valid for the new ENUM or set them to 'pending'
      await pool.query("UPDATE competitions SET status = 'approved' WHERE status IN ('Open', 'Active', 'approved')");
      await pool.query("UPDATE competitions SET status = 'pending' WHERE status NOT IN ('approved', 'rejected')");
      
      await pool.query("ALTER TABLE competitions MODIFY COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending'");
      console.log("✅ Updated status to ENUM('pending', 'approved', 'rejected')");
    } catch (e) { console.error("❌ Error updating status:", e.message); }

    // 5. Ensure createdBy is present and correct type
    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM competitions LIKE 'createdBy'");
      if (cols.length > 0) {
        // Change to INT if it was VARCHAR? Or keep as is?
        // User requirements say "createdBy (student)". Best to use INT referencing students(id)
        await pool.query("ALTER TABLE competitions MODIFY COLUMN createdBy INT NULL");
        console.log("✅ Updated createdBy to INT");
      } else {
        await pool.query("ALTER TABLE competitions ADD COLUMN createdBy INT NULL AFTER registrationLink");
        console.log("✅ Added createdBy column");
      }
    } catch (e) { console.error(e); }

    console.log("🏁 Migration complete.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
}

migrate();
