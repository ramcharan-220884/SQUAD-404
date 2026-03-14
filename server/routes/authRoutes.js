import express from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password, role } = req.body; // Expecting role from frontend

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password, and role are required" });
    }

    let users = [];
    let roleName = "";
    let userIdField = "";

    // Determine which table to query
    if (role === "student") {
      [users] = await pool.query("SELECT * FROM students WHERE email=?", [email]);
      roleName = "student";
      userIdField = "user_id";
    } else if (role === "company") {
      [users] = await pool.query("SELECT * FROM companies WHERE email=?", [email]);
      roleName = "company";
      userIdField = "company_id";
    } else if (role === "admin") {
      [users] = await pool.query("SELECT * FROM admins WHERE email=?", [email]);
      roleName = "admin";
      userIdField = "admin_id";
    } else {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Step 1: Verify credentials first
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Step 2: After validation, check if approved
    if (user.approved === false || user.approved === 0) {
      return res.status(403).json({ error: "Account pending approval" });
    }

    // Step 4: Generate JWT and set in secure cookie
    const token = jwt.sign(
      { id: user[userIdField], role: roleName },
      process.env.JWT_SECRET,
      { expiresIn: "10h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 36000000
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user[userIdField],
        name: user.name,
        email: user.email,
        role: roleName,
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
});

export default router;