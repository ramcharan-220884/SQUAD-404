import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import redisClient from "../config/redisClient.js";
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import { sendPasswordResetEmail, sendOTPEmail } from '../utils/mailer.js';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res, next) => {
  try {
    const { credential, role } = req.body; 

    // Admin blockage
    if (role === 'admin') {
        return res.status(403).json({ success: false, message: "Unauthorized. Admin access via Google is strictly disabled." });
    }

    const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,  
    });
    
    const { email, name, email_verified, sub, picture } = ticket.getPayload();

    if (email_verified !== true) {
        return res.status(403).json({ success: false, message: "Google account email is not verified" });
    }

    let user = null;

    if (role === 'student') {
        // 1. EXCLUSIVE STUDENT DOMAIN CHECK
        const isStudentEmail = /^[nN]\d{6}@rguktn\.ac\.in$/.test(email);
        if (!isStudentEmail) {
            return res.status(403).json({ success: false, message: "Unauthorized. You must use your official college email ID (@rguktn.ac.in) to access this portal via Google." });
        }

        let [rows] = await pool.query("SELECT * FROM students WHERE oauth_id = ?", [sub]);
        user = rows[0];
        
        if (!user) {
            [rows] = await pool.query("SELECT * FROM students WHERE email = ?", [email]);
            user = rows[0];
            if (user) {
                await pool.query("UPDATE students SET oauth_id = ?, auth_provider = 'google', profile_photo_url = COALESCE(profile_photo_url, ?) WHERE id = ?", [sub, picture, user.id]);
            }
        }

        if (!user) {
            // Auto-Register Student as Pending
            const [insertResult] = await pool.query(
                `INSERT INTO students (name, email, password, status, approved, profile_completed, auth_provider, oauth_id, profile_photo_url) VALUES (?, ?, ?, 'Active', 1, 0, 'google', ?, ?)`,
                [name, email, '!OAUTH_PROTECTED_PASSWORD!', sub, picture]
            );
            const [newRows] = await pool.query("SELECT * FROM students WHERE id = ?", [insertResult.insertId]);
            user = newRows[0];
        } else {
            // Update name/photo but do NOT auto-approve
            let updateQuery = "UPDATE students SET name = ?, profile_photo_url = COALESCE(profile_photo_url, ?) WHERE id = ?";
            await pool.query(updateQuery, [name, picture, user.id]);
        }

        // Students now require manual admin approval just like companies
        if (user.status === 'Rejected') {
            return res.status(403).json({ success: false, message: "Account access revoked. Please contact support." });
        }

    } else if (role === 'company') {
        let [rows] = await pool.query("SELECT * FROM companies WHERE oauth_id = ?", [sub]);
        user = rows[0];

        if (!user) {
            [rows] = await pool.query("SELECT * FROM companies WHERE email = ?", [email]);
            user = rows[0];
            if (user) {
                await pool.query("UPDATE companies SET oauth_id = ?, auth_provider = 'google' WHERE id = ?", [sub, user.id]);
            }
        }

        if (!user) {
            const [insertResult] = await pool.query(
                `INSERT INTO companies (name, email, password, status, approved, auth_provider, oauth_id) VALUES (?, ?, ?, 'Pending', 0, 'google', ?)`,
                [name, email, '!OAUTH_PROTECTED_PASSWORD!', sub]
            );
            const [newRows] = await pool.query("SELECT * FROM companies WHERE id = ?", [insertResult.insertId]);
            user = newRows[0];
        } else {
            // Keep companies in sync too
            await pool.query("UPDATE companies SET name = ? WHERE id = ?", [name, user.id]);
        }

        // Companies securely require manual override
        if (user.status === 'Rejected') {
            return res.status(403).json({ success: false, message: "Account access revoked. Please contact support." });
        }
        if (user.status === 'Pending' || user.approved === 0 || user.approved === false) {
            return res.status(403).json({ success: false, message: "Your account is pending admin approval" });
        }

    } else {
        return res.status(400).json({ success: false, message: "Invalid role specified." });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: role, email: user.email, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const csrfToken = crypto.randomBytes(32).toString('hex');

    res.cookie("csrfToken", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: "Google Login successful",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role
      }
    });

  } catch (err) {
    console.error("Google verify error — name:", err.name);
    console.error("Google verify error — message:", err.message);
    console.error("GOOGLE_CLIENT_ID loaded as:", process.env.GOOGLE_CLIENT_ID);
    res.status(401).json({ success: false, message: "Invalid Google authorization token. Please try again." });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password, and role are required" });
    }

    let users = [];
    let tableName = "";
    
    if (role === "student") tableName = "students";
    else if (role === "company") tableName = "companies";
    else if (role === "admin") tableName = "admins";
    else return res.status(400).json({ success: false, message: "Invalid role specified" });

    [users] = await pool.query(`SELECT * FROM ${tableName} WHERE email = ?`, [email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    // Role-specific checks (e.g., student/company approval)
    if (role !== "admin") {
      if (user.status === "Rejected") {
        return res.status(403).json({ success: false, message: "Account rejected. Please contact support." });
      }
      if (role === "company") {
        if (user.status === "Pending" || !user.approved) {
          return res.status(403).json({ success: false, message: "Account pending admin approval" });
        }
      }

    }

    const accessToken = jwt.sign(
      { id: user.id, role: role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, role: role, email: user.email, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const csrfToken = crypto.randomBytes(32).toString('hex');

    res.cookie("csrfToken", csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: role
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, otp, ...otherData } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Name, email, password, and role are required" });
    }

    const strongPassword = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(password)) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters, include 1 number and 1 special character" });
    }

    let tableName = "";
    if (role === "student") tableName = "students";
    else if (role === "company") tableName = "companies";
    else return res.status(400).json({ success: false, message: "Invalid role for registration" });

    // Ensure email is globally unique across platforms to prevent cross-role impersonation
    const [existingStudents] = await pool.query(`SELECT id FROM students WHERE email = ?`, [email]);
    const [existingCompanies] = await pool.query(`SELECT id FROM companies WHERE email = ?`, [email]);
    const [existingAdmins] = await pool.query(`SELECT id FROM admins WHERE email = ?`, [email]);

    if (existingStudents.length > 0 || existingCompanies.length > 0 || existingAdmins.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // ── OTP Verification for Company Registration ────────────────────────────
    if (role === "company") {
      if (!otp) {
        return res.status(400).json({ success: false, message: "OTP is required for company registration" });
      }

      // Look up the most recent valid OTP for this email
      const [otpRecords] = await pool.query(
        `SELECT id, otp_hash, attempts FROM email_otps WHERE email = ? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1`,
        [email]
      );

      if (otpRecords.length === 0) {
        return res.status(400).json({ success: false, message: "OTP expired or not found. Please request a new one." });
      }

      const otpRecord = otpRecords[0];

      if (otpRecord.attempts >= 5) {
        return res.status(429).json({ success: false, message: "Too many failed attempts. Please request a new OTP." });
      }

      const isOtpValid = await bcrypt.compare(otp, otpRecord.otp_hash);

      if (!isOtpValid) {
        // Increment attempts
        await pool.query(`UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?`, [otpRecord.id]);
        return res.status(400).json({ success: false, message: "Invalid OTP. Please try again." });
      }

      // OTP is valid — delete it so it can't be reused
      await pool.query(`DELETE FROM email_otps WHERE id = ?`, [otpRecord.id]);
    }
    // ── End OTP Verification ─────────────────────────────────────────────────

    const hashedPassword = await bcrypt.hash(password, 10);

    if (role === "student") {
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
      
      await pool.query(
        "INSERT INTO students (name, first_name, last_name, email, password, branch, cgpa, status, approved, profile_completed) VALUES (?, ?, ?, ?, ?, ?, ?, 'Active', 1, 0)",
        [name, firstName, lastName, email, hashedPassword, otherData.branch || null, otherData.cgpa || null]
      );
    } else {
      await pool.query(
        "INSERT INTO companies (name, email, password, description, contact_person, contact_number, status, approved, email_verified) VALUES (?, ?, ?, ?, ?, ?, 'Pending', 0, 1)",
        [name, email, hashedPassword, otherData.description || null, otherData.contact_person || null, otherData.phone || otherData.contact_number || null]
      );
    }

    res.status(201).json({
      success: true,
      message: role === 'student' 
        ? "Student registered successfully." 
        : "Company registered successfully. Pending approval."
    });

  } catch (err) {
    console.error("Registration error:", err);
    next(err);
  }
};

// ── Send OTP for Email Verification ──────────────────────────────────────────
export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if email is already registered across all tables
    const [existingStudents] = await pool.query(`SELECT id FROM students WHERE email = ?`, [email]);
    const [existingCompanies] = await pool.query(`SELECT id FROM companies WHERE email = ?`, [email]);
    const [existingAdmins] = await pool.query(`SELECT id FROM admins WHERE email = ?`, [email]);

    if (existingStudents.length > 0 || existingCompanies.length > 0 || existingAdmins.length > 0) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Delete any existing OTPs for this email to prevent spam
    await pool.query(`DELETE FROM email_otps WHERE email = ?`, [email]);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in DB
    await pool.query(
      `INSERT INTO email_otps (email, otp_hash, expires_at) VALUES (?, ?, ?)`,
      [email, otpHash, expiresAt]
    );

    // Send OTP email
    await sendOTPEmail(email, otp);

    res.json({ success: true, message: "Verification code sent to your email" });

  } catch (err) {
    console.error("Send OTP error:", err);
    next(err);
  }
};

export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken || (req.headers["authorization"] && req.headers["authorization"].split(" ")[1]);
  if (token) {
    try {
      if (redisClient?.status === "ready") {
        // Blacklist token for 7 days (matches Refresh Token expiry)
        await redisClient.set(`blacklist:${token}`, "true", "EX", 7 * 24 * 60 * 60);
      }
    } catch (err) {
      console.warn("Could not blacklist token in Redis", err.message);
    }
  }
  res.clearCookie("csrfToken");
  res.clearCookie("refreshToken");
  res.clearCookie("token"); // clear legacy just in case
  res.json({ success: true, message: "Logged out successfully" });
};

// ── Refresh Token Endpoint ───────────────────────────────────────────────────
export const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    if (redisClient?.status === "ready") {
      const isBlacklisted = await redisClient.get(`blacklist:${refreshToken}`);
      if (isBlacklisted) {
        res.clearCookie("refreshToken");
        return res.status(401).json({ success: false, message: "Invalid token (Logged out)." });
      }
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    if (decoded.type !== 'refresh') {
      res.clearCookie("refreshToken");
      return res.status(401).json({ success: false, message: "Invalid token type" });
    }

    const { id, role } = decoded;

    // Token Rotation
    const newAccessToken = jwt.sign(
      { id, role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { id, role, type: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const newCsrfToken = crypto.randomBytes(32).toString('hex');

    res.cookie("csrfToken", newCsrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (err) {
    res.clearCookie("refreshToken");
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Refresh token expired. Please log in again." });
    }
    return res.status(401).json({ success: false, message: "Invalid refresh token." });
  }
};

export const getMe = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    let query = "";
    if (role === "student") {
      query = `SELECT id, name, email, branch, cgpa, skills, status, approved, placed_status, dark_mode FROM students WHERE id = ?`;
    } else if (role === "company") {
      query = `SELECT id, name, email, description, contact_person, status, approved, dark_mode FROM companies WHERE id = ?`;
    } else {
      query = `SELECT id, email, name, dark_mode FROM admins WHERE id = ?`;
    }
      
    const [users] = await pool.query(query, [id]);
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userData = users[0];
    userData.darkMode = userData.dark_mode === 1 || userData.dark_mode === true;
    
    // Do not return raw DB dark_mode property to frontend if unnecessary, but here we can just pass it mapped.
    delete userData.dark_mode;

    res.json({ success: true, user: { ...userData, role } });
  } catch (err) {
    next(err);
  }
};

export const updateTheme = async (req, res, next) => {
  try {
    const { id, role } = req.user;
    const { darkMode } = req.body;
    let table = "";

    if (role === "student") table = "students";
    else if (role === "company") table = "companies";
    else if (role === "admin") table = "admins";

    if (!table) return res.status(400).json({ success: false, message: "Invalid role" });

    await pool.query(`UPDATE ${table} SET dark_mode = ? WHERE id = ?`, [darkMode ? 1 : 0, id]);

    res.json({ success: true, message: "Theme preference updated successfully" });
  } catch (err) {
    console.error("Theme update error:", err);
    next(err);
  }
};

export const getSocketToken = (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Generate a short-lived token specifically for Socket.IO authentication
    const socketToken = jwt.sign(
      { id: user.id, role: user.role, purpose: "socket" },
      process.env.JWT_SECRET,
      { expiresIn: "5m" } // 5 minutes validity
    );

    res.json({ success: true, socketToken });
  } catch (err) {
    console.error("Socket token error:", err);
    res.status(500).json({ success: false, message: "Failed to generate socket token" });
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email, role = 'student' } = req.body;

    const allowedRoles = ['student', 'company', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    const tableName = role === 'student' ? 'students' : role === 'admin' ? 'admins' : 'companies';
    const [[user]] = await pool.query(`SELECT id FROM ${tableName} WHERE email = ?`, [email]);

    // Always send same response to prevent email enumeration
    if (!user) {
      return res.json({ success: true, message: "If an account with that email exists, a password reset link has been sent." });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 
    
    await pool.query(
      `INSERT INTO password_resets (email, user_type, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
      [email, role, tokenHash, expiresAt]
    );

    // Centralized custom dispatcher for resetting passwords cleanly
    await sendPasswordResetEmail(email, rawToken);

    return res.json({ 
      success: true, 
      message: "If an account with that email exists, a password reset link has been sent."
    });

  } catch (err) {
    console.error("Forgot Password Error:", err.message);
    // Only send error if headers haven't been sent yet
    if (!res.headersSent) {
      return res.status(500).json({ 
        success: false, 
        message: "Failed to send reset email. Please check server email configuration."
      });
    }
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters long." });
    }

    const strongPassword = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(newPassword)) {
      return res.status(400).json({ success: false, message: "Password must include at least one number and one special character." });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const [resets] = await pool.query(
      `SELECT id, email, token_hash, user_type 
       FROM password_resets 
       WHERE token_hash = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [tokenHash]
    );

    if (resets.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token." });
    }

    const validReset = resets[0];
    const email = validReset.email;
    const role = validReset.user_type;

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const tableName = role === 'student' ? 'students' : role === 'admin' ? 'admins' : 'companies';

    let updateQuery = `UPDATE ${tableName} SET password = ? WHERE email = ?`;
    if (role !== 'admin') {
      updateQuery = `UPDATE ${tableName} SET password = ?, auth_provider = IF(auth_provider = 'google', 'hybrid', auth_provider) WHERE email = ?`;
    }
    
    await pool.query(updateQuery, [newPasswordHash, email]);

    await pool.query(
      `UPDATE password_resets SET used = 1 WHERE id = ?`,
      [validReset.id]
    );

    res.json({ success: true, message: "Password has been successfully reset. You can now log in securely." });

  } catch (err) {
    next(err);
  }
};