import express from "express";
import { getJobs, postJob } from "../controllers/jobController.js";

const router = express.Router();

// Get all jobs
router.get("/all", getJobs);

// Company posts a job
router.post("/post", postJob);

export default router;