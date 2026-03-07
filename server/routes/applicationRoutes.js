import express from "express";
import { applyJob, getApplicants, getStudentApplications, getJobApplicants, updateApplicationStatus } from "../controllers/applicationController.js";

const router = express.Router();

// Student applies for job
router.post("/apply", applyJob);

// Company views applicants for a job
router.get("/job/:jobId", getApplicants);

router.get("/student/:student_id", getStudentApplications);

router.get("/job/:job_id", getJobApplicants);

router.put("/:application_id/status", updateApplicationStatus);

export default router;