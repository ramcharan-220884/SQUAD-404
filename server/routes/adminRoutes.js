import express from "express";

// ── Phase 1 Domain Controllers ─────────────────────────────────────────────
import { getStats, getUsers, getPendingUsers, approveUser, rejectUser, getAllStudents, updateStudentAdmin, updatePlacementStatus } from "../controllers/adminStudentController.js";
import { getAdminInterviews, createInterview, updateInterview, deleteInterview } from "../controllers/adminInterviewController.js";
import { postAnnouncement, updateAnnouncement, deleteAnnouncement } from "../controllers/adminAnnouncementController.js";

// ── Phase 2 Domain Controllers ─────────────────────────────────────────────
import { getAdminCompetitions, createCompetition, updateCompetition, deleteCompetition, updateCompetitionStatus } from "../controllers/adminCompetitionController.js";
import { getAdminEvents, createEvent, updateEvent, deleteEvent } from "../controllers/adminEventController.js";
import { getAdminAssessments, getAssessmentAttempts, createAssessment, updateAssessment, deleteAssessment } from "../controllers/adminAssessmentController.js";
import { getSettings, updateSettings, getAdminProfile, updateAdminProfile, changeAdminPassword } from "../controllers/adminSettingsController.js";

// ── Phase 3 Domain Controllers ─────────────────────────────────────────────
import { getPlacementAnalytics } from "../controllers/adminAnalyticsController.js";
import { getAllCompanies, updateCompanyAdmin } from "../controllers/adminCompanyController.js";
import { getTickets, updateTicketStatus } from "../controllers/adminTicketController.js";

import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { 
  approveUserSchema, rejectUserSchema, updateStudentAdminSchema, 
  updateCompanyAdminSchema, ticketStatusSchema, settingsSchema, 
  adminProfileSchema, changeAdminPasswordSchema, 
  createEventSchema, createCompetitionSchema, createAssessmentSchema, createInterviewSchema 
} from "../validations/admin.validation.js";
import { createAnnouncementSchema, updateAnnouncementSchema } from "../validations/announcement.validation.js";
const router = express.Router();

router.use(verifyToken);
router.use(requireRole("admin"));

// ── Dashboard & Stats ──────────────────────────────────────────────────────
router.get("/stats", getStats);
router.get("/users", getUsers);
router.get("/pending-users", getPendingUsers);
router.get("/placement-analytics", getPlacementAnalytics);
router.put("/approve-user", validate(approveUserSchema), approveUser);
router.delete("/reject-user", validate(rejectUserSchema), rejectUser);

// ── Students ───────────────────────────────────────────────────────────────
router.get("/students", getAllStudents);
router.patch("/students/:id", validate(updateStudentAdminSchema), updateStudentAdmin);
router.put("/placement-status", updatePlacementStatus);

// ── Companies ──────────────────────────────────────────────────────────────
router.get("/companies", getAllCompanies);
router.patch("/companies/:id", validate(updateCompanyAdminSchema), updateCompanyAdmin);

// ── Support Tickets ────────────────────────────────────────────────────────
router.get("/tickets", getTickets);
router.put("/tickets/status", validate(ticketStatusSchema), updateTicketStatus);

// ── Settings & Profile ─────────────────────────────────────────────────────
router.get("/settings", getSettings);
router.put("/settings", validate(settingsSchema), updateSettings);
router.get("/profile", getAdminProfile);
router.put("/profile", validate(adminProfileSchema), updateAdminProfile);
router.put("/change-password", validate(changeAdminPasswordSchema), changeAdminPassword);

// ── Announcements ──────────────────────────────────────────────────────────
router.post("/announcements", validate(createAnnouncementSchema), postAnnouncement);
router.patch("/announcements/:id", validate(updateAnnouncementSchema), updateAnnouncement);
router.delete("/announcements/:id", validate(updateAnnouncementSchema), deleteAnnouncement);

// ── Competitions ───────────────────────────────────────────────────────────
router.get("/competitions", getAdminCompetitions);
router.post("/competitions", validate(createCompetitionSchema), createCompetition);
router.patch("/competitions/:id", validate(createCompetitionSchema), updateCompetition);
router.delete("/competitions/:id", deleteCompetition);
router.patch("/competitions/:id/status", updateCompetitionStatus);

// ── Events ─────────────────────────────────────────────────────────────────
router.get("/events", getAdminEvents);
router.post("/events", validate(createEventSchema), createEvent);
router.patch("/events/:id", validate(createEventSchema), updateEvent);
router.delete("/events/:id", deleteEvent);

// ── Assessments ────────────────────────────────────────────────────────────
router.get("/assessments", getAdminAssessments);
router.get("/assessments/:id/attempts", getAssessmentAttempts);
router.post("/assessments", validate(createAssessmentSchema), createAssessment);
router.patch("/assessments/:id", validate(createAssessmentSchema), updateAssessment);
router.delete("/assessments/:id", deleteAssessment);

// ── Interviews ─────────────────────────────────────────────────────────────
router.get("/interviews", getAdminInterviews);
router.post("/interviews", validate(createInterviewSchema), createInterview);
router.patch("/interviews/:id", validate(createInterviewSchema), updateInterview);
router.delete("/interviews/:id", deleteInterview);

// ── Applications & Candidate Communication ─────────────────────────────────
import { getAdminApplications, notifyCandidates } from "../controllers/adminApplicationController.js";
import { notifyCandidatesSchema } from "../validations/admin.validation.js";

router.get("/applications", getAdminApplications);
router.post("/notify-candidates", validate(notifyCandidatesSchema), notifyCandidates);

export default router;
