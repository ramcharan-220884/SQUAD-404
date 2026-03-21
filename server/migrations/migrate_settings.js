import { pool } from "./config/db.js";

async function migrateDarkMode() {
    try {
        console.log("Starting migration: Add dark_mode to students...");
        await pool.query("ALTER TABLE students ADD COLUMN dark_mode BOOLEAN DEFAULT false;");
        console.log("Migration successful: added dark_mode column.");
    } catch (e) {
        if (e.code === 'ER_DUP_COLUMN_NAME') {
            console.log("Column 'dark_mode' already exists.");
        } else {
            console.error("Migration failed:", e);
        }
    }
    process.exit(0);
}

migrateDarkMode();
