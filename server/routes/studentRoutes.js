import express from "express";
import { 
  getProfile, updateProfile, getAvailableJobs, 
  submitTicket,
  getAnnouncements, withdrawApplication,
  getPublicSettings,
  getCompetitions, registerForCompetition, submitCompetition,
  getEvents, registerForEvent, submitEvent, submitResource, getMySubmissions, getResources,
  getAssessments, updateAssessmentStatus,
  getMyApplicationRounds,
  getNotifications, markNotificationRead
} from "../controllers/studentController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { updateProfileSchema, submitTicketSchema, registerCompetitionEventSchema, updateAssessmentStatusSchema, createCompetitionSchema, submitEventSchema, submitResourceSchema } from "../validations/student.validation.js";
const router = express.Router();

router.use(verifyToken);
router.use(requireRole("student"));

router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.get("/jobs", getAvailableJobs);
router.post("/tickets", validate(submitTicketSchema), submitTicket);
router.delete("/applications/:id", withdrawApplication);
router.get("/applications/:id/rounds", getMyApplicationRounds);
router.get("/settings", getPublicSettings);

router.get("/announcements", getAnnouncements);
router.get("/my-submissions", getMySubmissions);

router.get("/competitions", getCompetitions);
router.post("/competitions", validate(createCompetitionSchema), submitCompetition);
router.post("/competitions/register", validate(registerCompetitionEventSchema), registerForCompetition);

router.get("/events", getEvents);
router.post("/events", validate(submitEventSchema), submitEvent);
router.post("/events/register", validate(registerCompetitionEventSchema), registerForEvent);

router.get("/resources", getResources);
router.post("/resources", validate(submitResourceSchema), submitResource);

router.get("/assessments", getAssessments);
router.post("/assessments/status", validate(updateAssessmentStatusSchema), updateAssessmentStatus);

// Notification routes
router.get("/notifications", getNotifications);
router.patch("/notifications/:id/read", markNotificationRead);

export default router;