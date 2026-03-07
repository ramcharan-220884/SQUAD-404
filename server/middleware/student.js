import express from "express";
import { getAppliedJobs } from "../controllers/studentDashboard.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET: Applied jobs + upcoming drives
router.get("/applied-jobs", verifyToken, getAppliedJobs);

export default router;