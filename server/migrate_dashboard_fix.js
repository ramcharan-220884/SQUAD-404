import { pool } from './config/db.js';

async function migrate() {
    try {
        console.log("Starting dashboard fix migration...");

        // 1. Add status to interviews
        console.log("Checking interviews table...");
        const [intCols] = await pool.query("SHOW COLUMNS FROM interviews LIKE 'status'");
        if (intCols.length === 0) {
            console.log("Adding 'status' column to interviews...");
            await pool.query("ALTER TABLE interviews ADD COLUMN status VARCHAR(50) DEFAULT 'Scheduled'");
        } else {
            console.log("'status' column already exists in interviews.");
        }

        // 2. Add evaluation_status to assessment_attempts
        console.log("Checking assessment_attempts table...");
        const [assCols] = await pool.query("SHOW COLUMNS FROM assessment_attempts LIKE 'evaluation_status'");
        if (assCols.length === 0) {
            console.log("Adding 'evaluation_status' column to assessment_attempts...");
            await pool.query("ALTER TABLE assessment_attempts ADD COLUMN evaluation_status VARCHAR(50) DEFAULT 'Pending'");
        } else {
            console.log("'evaluation_status' column already exists in assessment_attempts.");
        }

        console.log("Migration completed successfully.");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
