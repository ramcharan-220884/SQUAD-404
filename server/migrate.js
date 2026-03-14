import { pool } from "./config/db.js";

async function migrate() {
    try {
        console.log("Starting migration...");
        
        try {
            await pool.query("ALTER TABLE students ADD COLUMN approved BOOLEAN DEFAULT false;");
            console.log("Added 'approved' to students");
        } catch (e) {
            console.log("students table altered or not found: ", e.message);
        }
        
        try {
            await pool.query("ALTER TABLE companies ADD COLUMN approved BOOLEAN DEFAULT false;");
            console.log("Added 'approved' to companies");
        } catch (e) {
            console.log("companies table altered or not found: ", e.message);
        }

        try {
            await pool.query("ALTER TABLE admins ADD COLUMN approved BOOLEAN DEFAULT false;");
            console.log("Added 'approved' to admins");
        } catch (e) {
            console.log("admins table altered or not found (ignoring): ", e.message);
        }

        try {
            await pool.query("UPDATE students SET approved=true WHERE status='Active';");
            console.log("Updated active students to approved");
        } catch (e) {}

        try {
            await pool.query("UPDATE companies SET approved=true WHERE status='Active';");
            console.log("Updated active companies to approved");
        } catch (e) {}
        
        try {
            await pool.query("UPDATE admins SET approved=true WHERE status='Active';");
        } catch(e) {}

        console.log("Migration complete.");
    } catch(e) {
        console.error("Migration failed:", e);
    }
    process.exit(0);
}

migrate();
