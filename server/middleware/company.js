import express from "express";
import {
  getPostedJobs,
  postJob,
  updateApplicationStatus,
} from "../controllers/companyController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/jobs", verifyToken, getPostedJobs);
router.post("/jobs", verifyToken, postJob);
router.put("/applications", verifyToken, updateApplicationStatus);

export default router;