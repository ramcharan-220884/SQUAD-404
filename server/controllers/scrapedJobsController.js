import { pool as db } from '../config/db.js';
import { scrapeAllCompanies } from '../services/scraperService.js';
import { sendJobOutreachEmail } from '../utils/mailer.js';

export const getAllJobs = async (req, res) => {
    try {
        const [jobs] = await db.query('SELECT * FROM scraped_jobs ORDER BY created_at DESC');
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        console.error('[ScrapedJobs Controller] Get All Jobs Error:', error);
        res.status(500).json({ success: false, message: 'Database Error', error: error.message });
    }
};

export const runScraperManually = async (req, res) => {
    try {
        scrapeAllCompanies().catch(err => console.error('[ScrapedJobs Controller] Manual Scrape Error:', err));
        
        res.status(200).json({ 
            success: true, 
            message: 'Manual scraping job started in the background out of band.' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to start manual scraper', error: error.message });
    }
};

export const contactJob = async (req, res) => {
    const { id } = req.body;
    
    try {
        if (!id) return res.status(400).json({ success: false, message: 'Job ID is required in the body' });

        const [jobs] = await db.query('SELECT hr_email, company_name, job_title FROM scraped_jobs WHERE id = ?', [id]);
        if (jobs.length === 0) return res.status(404).json({ success: false, message: 'Job not found in database' });
        
        const jobTarget = jobs[0];
        if (!jobTarget.hr_email) {
            return res.status(400).json({ success: false, message: 'No parsed HR email available to contact for this job.' });
        }

        await sendJobOutreachEmail(jobTarget.hr_email, {
            company_name: jobTarget.company_name,
            job_title: jobTarget.job_title
        });

        await db.query('UPDATE scraped_jobs SET status = ? WHERE id = ?', ['contacted', id]);
        
        res.status(200).json({ success: true, message: `Email delivered to ${jobTarget.company_name} and status marked as contacted.` });
    } catch (error) {
        console.error('[ScrapedJobs Controller] Contact HR Error:', error);
        res.status(500).json({ success: false, message: 'Failed to process email/database update.', error: error.message });
    }
};

export const convertJob = async (req, res) => {
    const { id } = req.body;
    
    try {
        if (!id) return res.status(400).json({ success: false, message: 'Job ID is required in the body' });

        const [result] = await db.query('UPDATE scraped_jobs SET status = ? WHERE id = ?', ['converted', id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Job ID not found' });
        }

        res.status(200).json({ success: true, message: 'Job has successfully been converted.' });
    } catch (error) {
        console.error('[ScrapedJobs Controller] Convert Job Error:', error);
        res.status(500).json({ success: false, message: 'Database Error', error: error.message });
    }
};

export const getCompanySuggestions = async (req, res) => {
    // We assume the user is a company due to frontend routing, and their email is in req.user
    const email = req.user?.email || req.query.email; 
    
    try {
        if (!email) return res.status(400).json({ success: false, message: 'Email identifier is required' });

        const [jobs] = await db.query('SELECT * FROM scraped_jobs WHERE hr_email = ? ORDER BY created_at DESC', [email]);
        
        res.status(200).json({ success: true, count: jobs.length, data: jobs });
    } catch (error) {
        console.error('[ScrapedJobs Controller] Suggestions Error:', error);
        res.status(500).json({ success: false, message: 'Database Error', error: error.message });
    }
};
