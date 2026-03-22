import { pool } from '../config/db.js';

async function migrateEmailOtps() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS email_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        attempts INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_expires (expires_at)
      )
    `);
    console.log('email_otps table created successfully');

    // Cleanup expired OTPs periodically (optional: handled by server.js interval)
    await pool.query(`DELETE FROM email_otps WHERE expires_at < NOW()`);
    console.log('Cleaned up expired OTPs');

    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrateEmailOtps();
