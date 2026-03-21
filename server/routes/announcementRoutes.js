import express from "express";
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "../controllers/announcementController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { createAnnouncementSchema, updateAnnouncementSchema } from "../validations/announcement.validation.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", getAnnouncements);
router.post("/", requireRole("admin"), validate(createAnnouncementSchema), createAnnouncement);
router.delete("/:id", requireRole("admin"), validate(updateAnnouncementSchema), deleteAnnouncement);

export default router;
