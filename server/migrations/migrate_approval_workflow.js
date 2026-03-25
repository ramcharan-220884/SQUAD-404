import { pool } from '../config/db.js';

async function migrate() {
    try {
        console.log("Starting Migration for Approval Workflow...");

        // 1. Events Table
        console.log("Updating events table...");
        try {
            await pool.query(`
                ALTER TABLE events 
                ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
                ADD COLUMN submitted_by INT NULL,
                ADD COLUMN reviewed_by INT NULL,
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                ADD INDEX idx_events_status (status);
            `);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("events table already has these columns.");
            else throw e;
        }

        // 2. Competitions Table
        console.log("Updating competitions table...");
        try {
            await pool.query(`
                ALTER TABLE competitions 
                ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved',
                ADD COLUMN submitted_by INT NULL,
                ADD COLUMN reviewed_by INT NULL,
                ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                ADD INDEX idx_competitions_status (status);
            `);
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("competitions table already has these columns.");
            else throw e;
        }

        // 3. Student Resources Table
        console.log("Creating student_resources table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_resources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                link VARCHAR(255) NOT NULL,
                branch ENUM('CSE', 'ECE', 'EEE', 'Mechanical', 'Chemical') NOT NULL,
                category VARCHAR(100) NOT NULL,
                status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
                submitted_by INT NOT NULL,
                reviewed_by INT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_resources_status (status),
                INDEX idx_resources_branch_category (branch, category)
            );
        `);

        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}
migrate();
