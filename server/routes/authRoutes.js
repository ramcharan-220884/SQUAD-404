import express from "express";
import rateLimit from "express-rate-limit";
import { login, register, logout, getMe, updateTheme, getSocketToken, googleLogin, forgotPassword, resetPassword, refresh } from "../controllers/authController.js";
import { forgotPasswordLimiter } from "../middleware/rateLimiter.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { verifyCsrfToken } from "../middleware/csrfMiddleware.js";
import validate from "../middleware/validate.js";
import { registerSchema, loginSchema, googleLoginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validations/auth.validation.js";
const router = express.Router();

const globalAuthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, 
  message: { success: false, message: "Too many authentication attempts. Please try again after a minute." },
});

router.post("/login", globalAuthLimiter, validate(loginSchema), login);
router.post("/google", globalAuthLimiter, validate(googleLoginSchema), googleLogin);
router.post("/forgot-password", globalAuthLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", globalAuthLimiter, validate(resetPasswordSchema), resetPassword);
router.post("/register", globalAuthLimiter, validate(registerSchema), register);
router.post("/refresh", verifyCsrfToken, refresh);
router.post("/logout", verifyCsrfToken, logout);
router.get("/me", verifyToken, getMe);
router.put("/theme", verifyToken, updateTheme);
router.get("/socket-token", verifyToken, getSocketToken);

export default router;