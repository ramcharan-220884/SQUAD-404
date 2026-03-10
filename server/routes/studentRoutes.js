import express from "express";
import { registerStudent, loginStudent, getStudentProfile, updateStudentProfile } from "../controllers/studentController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);

// Profile endpoints
router.get("/:id", getStudentProfile);
router.put("/:id", updateStudentProfile);

export default router;