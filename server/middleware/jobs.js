import express from "express";
import { getJobs, applyJob } from "../controllers/jobController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getJobs);
router.post("/apply", verifyToken, applyJob);

export default router;