-- --------------------------------------------------------
-- Table structure for \`password_resets\`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    user_type ENUM('student', 'company', 'admin') NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    used TINYINT(1) DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for fast token lookups and email queries
    INDEX idx_token_hash (token_hash),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
