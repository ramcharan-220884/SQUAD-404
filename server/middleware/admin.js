import express from "express";
import { getStats, getUsers, updateUserStatus, sendNotification } from "../controllers/adminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/stats", verifyToken, getStats);
router.get("/users", verifyToken, getUsers);
router.put("/user-status", verifyToken, updateUserStatus);
router.post("/notifications", verifyToken, sendNotification);

export default router;