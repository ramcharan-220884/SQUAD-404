import { pool } from "./config/db.js";

async function migrateProfileFields() {
    try {
        console.log("Starting migration: Updating students table fields...");
        
        // Add profile_completed if it doesn't exist
        try {
            await pool.query("ALTER TABLE students ADD COLUMN profile_completed BOOLEAN DEFAULT false;");
            console.log("Added 'profile_completed' column.");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') {
                console.log("'profile_completed' column already exists.");
            } else {
                throw e;
            }
        }

        // Ensure dark_mode exists (it was added in a previous turn, but just in case)
        try {
            await pool.query("ALTER TABLE students ADD COLUMN dark_mode BOOLEAN DEFAULT false;");
            console.log("Added 'dark_mode' column.");
        } catch (e) {
            if (e.code === 'ER_DUP_COLUMN_NAME') {
                console.log("'dark_mode' column already exists.");
            } else {
                throw e;
            }
        }

        console.log("Migration complete.");
    } catch (e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}

migrateProfileFields();
