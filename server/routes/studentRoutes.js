import express from "express";
import { 
  getProfile, updateProfile, getAvailableJobs, 
  submitTicket,
  getAnnouncements, withdrawApplication,
  getPublicSettings,
  getCompetitions, registerForCompetition,
  getEvents, registerForEvent,
  getAssessments, updateAssessmentStatus
} from "../controllers/studentController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { updateProfileSchema, submitTicketSchema, registerCompetitionEventSchema, updateAssessmentStatusSchema } from "../validations/student.validation.js";
const router = express.Router();

router.use(verifyToken);
router.use(requireRole("student"));

router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.get("/jobs", getAvailableJobs);
router.post("/tickets", validate(submitTicketSchema), submitTicket);
router.delete("/applications/:id", withdrawApplication);
router.get("/settings", getPublicSettings);

router.get("/announcements", getAnnouncements);
router.get("/competitions", getCompetitions);
router.post("/competitions/register", validate(registerCompetitionEventSchema), registerForCompetition);
router.get("/events", getEvents);
router.post("/events/register", validate(registerCompetitionEventSchema), registerForEvent);
router.get("/assessments", getAssessments);
router.post("/assessments/status", validate(updateAssessmentStatusSchema), updateAssessmentStatus);

export default router;