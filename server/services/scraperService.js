import axios from 'axios';
import * as cheerio from 'cheerio';
import { pool as db } from '../config/db.js';

const SOURCES = [
    {
        name: 'Y-Combinator',
        url: 'https://www.ycombinator.com/jobs',
        item_selector: 'li.flex.flex-col',
        title_selector: 'div.job-name a',
        company_selector: 'span.company-name',
        location_selector: 'span.job-location',
        link_selector: 'div.job-name a'
    },
    {
        name: 'RemoteOK',
        url: 'https://remoteok.com/remote-dev-jobs',
        item_selector: 'tr.job',
        title_selector: 'h2',
        company_selector: 'h3',
        location_selector: 'div.location',
        link_selector: 'a.preventLink'
    },
    {
        name: 'We Work Remotely',
        url: 'https://weworkremotely.com/remote-jobs',
        item_selector: 'li.feature',
        title_selector: 'span.title',
        company_selector: 'span.company',
        location_selector: 'span.region',
        link_selector: 'a'
    }
];

const extractEmail = (text) => {
    if (!text) return null;
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i;
    const match = text.match(emailRegex);
    return match ? match[0].toLowerCase() : null;
};

const generateFallbackEmail = (url) => {
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return `careers@${domain}`;
    } catch {
        return 'careers@company.com';
    }
};

export const scrapeAllCompanies = async () => {
    console.log('[Scraper] Initializing Hybrid Scraping job...');

    for (const source of SOURCES) {
        console.log(`[Scraper] Target: ${source.name} | ${source.url}`);
        try {
            const { data: html } = await axios.get(source.url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                timeout: 15000
            });

            const $ = cheerio.load(html);
            const items = $(source.item_selector).slice(0, 10);
            let addedCount = 0;

            for (let i = 0; i < items.length; i++) {
                const el = items[i];
                const title = $(el).find(source.title_selector).text().trim();
                const company = $(el).find(source.company_selector).text().trim();
                const location = $(el).find(source.location_selector).text().trim();
                const path = $(el).find(source.link_selector).attr('href');
                
                if (!title || !company) continue;

                let link = path;
                if (path && !path.startsWith('http')) {
                    const base = new URL(source.url).origin;
                    link = base + path;
                }

                // Duplicate check (Composite: Title + Company)
                const [existing] = await db.query(
                    'SELECT id FROM scraped_jobs WHERE job_title = ? AND company_name = ? LIMIT 1',
                    [title, company]
                );

                if (existing.length === 0) {
                    const email = generateFallbackEmail(link || source.url);
                    
                    await db.query(`
                        INSERT INTO scraped_jobs 
                        (company_name, source_name, job_title, location, hr_email, email_type, source_url)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `, [company, source.name, title, location, email, 'guessed', link]);
                    
                    addedCount++;
                }
            }
            console.log(`[Scraper] ${source.name}: Added ${addedCount} jobs.`);
        } catch (err) {
            console.error(`[Scraper] ${source.name} Failed:`, err.message);
        }
    }
    console.log('[Scraper] Hybrid Scraping finished.');
};
