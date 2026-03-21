import express from "express";
import { createSupportTicket } from "../controllers/supportController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { submitTicketSchema } from "../validations/student.validation.js";

const router = express.Router();

router.use(verifyToken);
router.post("/report", validate(submitTicketSchema), createSupportTicket);

export default router;
