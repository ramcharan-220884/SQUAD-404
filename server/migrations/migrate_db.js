import { pool } from './config/db.js';

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS password_resets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL,
                user_type ENUM('student', 'company', 'admin') NOT NULL,
                token_hash VARCHAR(255) NOT NULL,
                used TINYINT(1) DEFAULT 0,
                expires_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX (email)
            );
        `);
        console.log("Table 'password_resets' created successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}
migrate();
