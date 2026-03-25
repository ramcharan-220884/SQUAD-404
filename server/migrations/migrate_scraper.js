import { pool } from '../config/db.js';

const migrateScraper = async () => {
    try {
        console.log("Starting scraper tables migration...");
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS company_sources (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                careers_url VARCHAR(2048) NOT NULL,
                title_selector VARCHAR(255) NOT NULL,
                description_selector VARCHAR(255) NOT NULL,
                location_selector VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created table: company_sources");

        await pool.query(`
            CREATE TABLE IF NOT EXISTS scraped_jobs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                company_name VARCHAR(255) NOT NULL,
                job_title VARCHAR(255) NOT NULL,
                description TEXT,
                skills TEXT,
                location VARCHAR(255),
                hr_email VARCHAR(255),
                source_url VARCHAR(2048) NOT NULL,
                status ENUM('pending', 'contacted', 'converted') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Created table: scraped_jobs");

        // Try creating indexes (ignore if they exist)
        try { await pool.query(`CREATE INDEX idx_scraped_jobs_status ON scraped_jobs(status);`); } catch(e) {}
        try { await pool.query(`CREATE INDEX idx_company_sources_name ON company_sources(company_name);`); } catch(e) {}
        try { await pool.query(`CREATE INDEX idx_scraped_jobs_company ON scraped_jobs(company_name);`); } catch(e) {}
        try { await pool.query(`CREATE INDEX idx_scraped_jobs_created_at ON scraped_jobs(created_at);`); } catch(e) {}
        console.log("Created indexes for scraper tables.");

        console.log("Scraper migration successfully completed!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateScraper();
