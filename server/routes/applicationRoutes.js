import express from "express";
import { applyJob, getApplicants, getStudentApplications, getJobApplicants, updateApplicationStatus, withdrawApplication } from "../controllers/applicationController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { applyJobSchema, getJobApplicantsSchema, getStudentApplicationsSchema, updateApplicationStatusSchema, withdrawApplicationSchema } from "../validations/application.validation.js";

const router = express.Router();

// Student applies for job
router.post("/apply", verifyToken, requireRole("student"), validate(applyJobSchema), applyJob);
router.post("/job/:jobId/apply", verifyToken, requireRole("student"), validate(applyJobSchema), applyJob); // Added per spec

// Company views applicants for a job
router.get("/job/:job_id", verifyToken, requireRole("company"), validate(getJobApplicantsSchema), getJobApplicants);

// Student views their own applications
router.get("/student/:student_id", verifyToken, requireRole("student"), validate(getStudentApplicationsSchema), getStudentApplications);

// Company updates application status
router.put("/:application_id/status", verifyToken, requireRole("company"), validate(updateApplicationStatusSchema), updateApplicationStatus);

// Student withdraws application
router.delete("/withdraw/:application_id", verifyToken, requireRole("student"), validate(withdrawApplicationSchema), withdrawApplication);

export default router;