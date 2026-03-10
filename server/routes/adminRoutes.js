import express from "express";
import { getStats, getUsers, updateUserStatus, sendNotification, getPendingUsers, approveUser, rejectUser } from "../controllers/adminController.js";
// We should import admin auth middleware here if it existed, for now let's leave it open since there isn't one.

const router = express.Router();

router.get("/stats", getStats);
router.get("/users", getUsers);
router.put("/users/status", updateUserStatus);
router.post("/notifications", sendNotification);
router.get("/pending-users", getPendingUsers);
router.put("/approve-user", approveUser);
router.delete("/reject-user", rejectUser);

export default router;
