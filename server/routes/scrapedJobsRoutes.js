import express from 'express';
import { verifyToken, requireRole } from '../middleware/authMiddleware.js';
import {
    getAllJobs,
    runScraperManually,
    contactJob,
    convertJob,
    getCompanySuggestions,
    updateJob,
    approveAndOnboard,
    notifyStudents
} from '../controllers/scrapedJobsController.js';

const router = express.Router();

router.get('/', verifyToken, requireRole('admin'), getAllJobs);
router.get('/company-suggestions', verifyToken, requireRole('company'), getCompanySuggestions);

router.post('/run-scraper', verifyToken, requireRole('admin'), runScraperManually);
router.post('/contact', verifyToken, requireRole('admin'), contactJob);
router.post('/convert', verifyToken, (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'company') next();
    else res.status(403).json({ success: false, message: 'Unauthorized' });
}, convertJob);
router.post('/update', verifyToken, requireRole('admin'), updateJob);
router.post('/approve-onboard', verifyToken, requireRole('admin'), approveAndOnboard);
router.post('/notify-students', verifyToken, requireRole('admin'), notifyStudents);

export default router;
