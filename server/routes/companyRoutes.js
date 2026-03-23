import express from "express";
import { 
  updateJobDetails, getMyCompanyDetails, 
  getCompanyStats, getCompanyJobs, getCompanyApplicants,
  updateCompanyApplicationStatus, getCompanyAnnouncements,
  getApplicationRounds, createApplicationRound, updateApplicationRound
} from "../controllers/companyController.js";
import { postJob } from "../controllers/jobController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { updateCompanyProfileSchema, updateCompanyApplicationStatusSchema } from "../validations/company.validation.js";
import { postJobSchema } from "../validations/job.validation.js";
const router = express.Router();

router.use(verifyToken);
router.use(requireRole("company"));

// Profile
router.get("/details", getMyCompanyDetails);
router.get("/profile", getMyCompanyDetails);
router.put("/profile", validate(updateCompanyProfileSchema), updateJobDetails);

// Jobs
router.get("/jobs", getCompanyJobs);
router.post("/jobs", validate(postJobSchema), postJob);

// Applicants & Applications
router.get("/applicants", getCompanyApplicants);
router.put("/applications/status", validate(updateCompanyApplicationStatusSchema), updateCompanyApplicationStatus);

// Stats
router.get("/stats", getCompanyStats);

// Announcements (read-only for company role)
router.get("/announcements", getCompanyAnnouncements);

// Rounds
router.get("/applications/:id/rounds", getApplicationRounds);
router.post("/applications/:id/rounds", createApplicationRound);
router.put("/rounds/:roundId/status", updateApplicationRound);

// Legacy
router.put("/job", validate(updateCompanyProfileSchema), updateJobDetails);

export default router;