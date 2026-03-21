import express from "express";
import { upload } from "../utils/fileUpload.js";
import { uploadFile } from "../controllers/uploadController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Require authentication for all uploads
router.use(verifyToken);

router.post("/photo", upload.single("photo"), uploadFile);
router.post("/resume", upload.single("resume"), uploadFile);
router.post("/screenshot", upload.single("screenshot"), uploadFile);

export default router;
