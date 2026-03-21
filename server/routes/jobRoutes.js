import express from "express";
import { getJobs, postJob } from "../controllers/jobController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { postJobSchema } from "../validations/job.validation.js";

const router = express.Router();

// Get all jobs
router.get("/all", verifyToken, getJobs);

// Company posts a job
router.post("/post", verifyToken, requireRole("company"), validate(postJobSchema), postJob);

export default router;