import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import { verifyToken, requireRole } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { settingsSchema } from "../validations/admin.validation.js";

const router = express.Router();

router.use(verifyToken);
router.use(requireRole("admin"));

router.get("/", getSettings);
router.put("/", validate(settingsSchema), updateSettings);

export default router;
