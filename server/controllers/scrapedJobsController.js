import bcrypt from 'bcrypt';
import { pool as db } from '../config/db.js';
import { scrapeAllCompanies } from '../services/scraperService.js';
import { sendJobOutreachEmail, sendCompanyCredentialsEmail } from '../utils/mailer.js';

export const getAllJobs = async (req, res) => {
    try {
        const [jobs] = await db.query('SELECT * FROM scraped_jobs ORDER BY created_at DESC');
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        console.error('[ScrapedJobs Controller] Get All Jobs Error:', error);
        res.status(500).json({ success: false, message: 'Database Error', error: error.message });
    }
};

export const updateJob = async (req, res) => {
    const { id, company_name, job_title, hr_email, location, description, is_approved, is_off_campus } = req.body;
    
    try {
        if (!id) return res.status(400).json({ success: false, message: 'Job ID is required' });

        const [result] = await db.query(
            'UPDATE scraped_jobs SET company_name = ?, job_title = ?, hr_email = ?, location = ?, description = ?, is_approved = ?, is_off_campus = ? WHERE id = ?',
            [company_name, job_title, hr_email, location, description, is_approved ? 1 : 0, is_off_campus ? 1 : 0, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Job ID not found' });
        }

        res.status(200).json({ success: true, message: 'Job details successfully updated.' });
    } catch (error) {
        console.error('[ScrapedJobs Controller] Update Job Error:', error);
        res.status(500).json({ success: false, message: 'Database Error', error: error.message });
    }
};

export const approveAndOnboard = async (req, res) => {
    const { id } = req.body;
    try {
        const [jobs] = await db.query('SELECT * FROM scraped_jobs WHERE id = ?', [id]);
        if (jobs.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
        
        const job = jobs[0];
        if (!job.hr_email) return res.status(400).json({ success: false, message: 'HR Email is required for onboarding' });

        // Check for existing company
        const [existing] = await db.query('SELECT id, password, approved FROM companies WHERE email = ?', [job.hr_email]);
        
        let companyId;
        let message = '';
        const tempPassword = Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        if (existing.length === 0) {
            // New Company Flow
            const [insertResult] = await db.query(`
                INSERT INTO companies (name, email, password, status, approved) 
                VALUES (?, ?, ?, 'Approved', 1)
            `, [job.company_name, job.hr_email, hashedPassword]);
            companyId = insertResult.insertId;

            await sendCompanyCredentialsEmail(job.hr_email, job.company_name, tempPassword);
            message = `Account created for ${job.hr_email} and credentials sent.`;
        } else {
            // Existing Company Flow
            companyId = existing[0].id;
            await db.query(`
                UPDATE companies SET status = 'Approved', approved = 1, password = ? 
                WHERE email = ?
            `, [hashedPassword, job.hr_email]);

            await sendCompanyCredentialsEmail(job.hr_email, job.company_name, tempPassword);
            message = `Account verified for ${job.hr_email} and new credentials sent.`;
        }

        // AUTOMATIC CONVERSION: Create the first-class job posting immediately
        await db.query(`
            INSERT INTO jobs (company_id, title, description, location, ctc, type, status)
            VALUES (?, ?, ?, ?, null, 'Full-time', 'Active')
        `, [companyId, job.job_title, job.description || 'Auto-generated from lead.', job.location]);

        // Update lead status to reflect it's both approved and converted
        await db.query('UPDATE scraped_jobs SET is_approved = 1, status = "converted" WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: message + " Job posting has been automatically activated in their dashboard." });
    } catch (error) {
        console.error('[ScrapedJobs Controller] Onboarding Error:', error);
        res.status(500).json({ success: false, message: 'Onboarding failed.', error: error.message });
    }
};

export const notifyStudents = async (req, res) => {
    const { id } = req.body;
    console.log(`[ScrapedJobs] Notify Students Triggered for ID: ${id}`);
    try {
        if (!id) return res.status(400).json({ success: false, message: 'Job ID is required' });
        
        await db.query('UPDATE scraped_jobs SET is_notified = 1, is_off_campus = 1 WHERE id = ?', [id]);
        console.log(`[ScrapedJobs] Success notifying for ID: ${id}`);
        res.status(200).json({ success: true, message: 'Job pushed to student dashboard as Off-Campus opportunity.' });
    } catch (error) {
        console.error(`[ScrapedJobs] Notify Students Error for ID ${id}:`, error);
        res.status(500).json({ success: false, message: 'Notification failed.', error: error.message });
    }
};

export const runScraperManually = async (req, res) => {
    try {
        scrapeAllCompanies().catch(err => console.error('[Scraper Error]:', err));
        res.status(200).json({ success: true, message: 'Scraping started in background.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to start scraper' });
    }
};

export const contactJob = async (req, res) => {
    const { id } = req.body;
    try {
        const [jobs] = await db.query('SELECT * FROM scraped_jobs WHERE id = ?', [id]);
        if (jobs.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
        
        const job = jobs[0];
        const targetEmail = job.hr_email?.trim();
        if (!targetEmail) return res.status(400).json({ success: false, message: 'No valid email available' });

        console.log(`[ScrapedJobs] Attempting outreach email to: ${targetEmail}`);

        await sendJobOutreachEmail(targetEmail, {
            company_name: job.company_name,
            job_title: job.job_title
        });

        await db.query("UPDATE scraped_jobs SET status = 'contacted' WHERE id = ?", [id]);
        res.status(200).json({ success: true, message: 'Outreach email sent successfully.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Email failed.', error: error.message });
    }
};

export const convertJob = async (req, res) => {
    const { id } = req.body;
    try {
        await db.query('UPDATE scraped_jobs SET status = "converted" WHERE id = ?', [id]);
        res.status(200).json({ success: true, message: 'Job converted.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Conversion failed.' });
    }
};

export const getCompanySuggestions = async (req, res) => {
    const email = req.user?.email || req.query.email;
    try {
        const [jobs] = await db.query('SELECT * FROM scraped_jobs WHERE hr_email = ? ORDER BY created_at DESC', [email]);
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Database Error' });
    }
};
