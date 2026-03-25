import axios from 'axios';
import * as cheerio from 'cheerio';
import { pool as db } from '../config/db.js';

/**
 * Minimal Regex utility to extract the first email found in a block of text.
 * @param {string} text 
 * @returns {string|null}
 */
const extractEmail = (text) => {
    if (!text) return null;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
    const match = text.match(emailRegex);
    return match ? match[0].toLowerCase() : null;
};

/**
 * Main worker function to scrape all company career pages.
 */
export const scrapeAllCompanies = async () => {
    console.log('[Scraper] Initializing scraping job...');

    try {
        // Fetch available scraping configurations from database
        const [companies] = await db.query('SELECT * FROM company_sources');

        if (!companies || companies.length === 0) {
            console.log('[Scraper] No company sources configured. Exiting.');
            return;
        }

        for (const company of companies) {
            console.log(`[Scraper] Starting scrape for ${company.company_name} at ${company.careers_url}`);

            try {
                // Fetch HTML with headers simulating a browser
                const { data: html } = await axios.get(company.careers_url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                    timeout: 10000
                });

                // Load HTML string into Cheerio
                const $ = cheerio.load(html);

                const jobTitles = $(company.title_selector);
                const jobDescriptions = $(company.description_selector);
                const jobLocations = company.location_selector ? $(company.location_selector) : null;

                const extractedJobs = [];

                // Extract DOM data
                jobTitles.each((index, element) => {
                    const jobTitle = $(element).text().trim();
                    if (!jobTitle) return;

                    const description = jobDescriptions.eq(index).text().trim() || null;
                    const location = jobLocations ? jobLocations.eq(index).text().trim() : null;

                    extractedJobs.push({ title: jobTitle, description, location });
                });

                let jobsAddedCount = 0;

                for (const job of extractedJobs) {
                    const hrEmail = extractEmail(job.description);

                    // De-duplication check
                    const [existingJobs] = await db.query(
                        `SELECT id FROM scraped_jobs WHERE company_name = ? AND job_title = ? LIMIT 1`,
                        [company.company_name, job.title]
                    );

                    if (existingJobs.length === 0) {
                        await db.query(`
                            INSERT INTO scraped_jobs 
                            (company_name, job_title, description, location, hr_email, source_url)
                            VALUES (?, ?, ?, ?, ?, ?)
                        `, [
                            company.company_name, 
                            job.title, 
                            job.description, 
                            job.location, 
                            hrEmail, 
                            company.careers_url
                        ]);
                        jobsAddedCount++;
                    }
                }

                console.log(`[Scraper] ${company.company_name}: Scrape successful. Added ${jobsAddedCount} new job(s).`);

            } catch (scrapeErr) {
                console.error(`[Scraper] Failed to fetch/parse ${company.company_name}:`, scrapeErr.message);
            }
        }

        console.log('[Scraper] Scraping job finished processing all companies.');

    } catch (globalErr) {
        console.error('[Scraper] Fatal Database Error while initializing scraper:', globalErr);
    }
};
