import express from 'express';
// Use whatever auth middleware is standard in this repo if you want to secure routes. 
// Standard assumption based on typical Express architectures. If you have verifyToken, add it here.
import {
    getAllJobs,
    runScraperManually,
    contactJob,
    convertJob,
    getCompanySuggestions
} from '../controllers/scrapedJobsController.js';

const router = express.Router();

router.get('/', getAllJobs);
router.get('/company-suggestions', getCompanySuggestions);

router.post('/run-scraper', runScraperManually);
router.post('/contact', contactJob);
router.post('/convert', convertJob);

export default router;
