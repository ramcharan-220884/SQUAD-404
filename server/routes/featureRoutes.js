import express from "express";
import { getEvents, getCompetitions, getInterviews, getAssessments } from "../controllers/featureController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/events", getEvents);
router.get("/competitions", getCompetitions);
router.get("/interviews", getInterviews);
router.get("/assessments", getAssessments);

export default router;
