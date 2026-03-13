import express from "express";
import { pool } from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (role !== "student" && role !== "company") {
      return res.status(400).json({ message: "Invalid role specified for registration" });
    }

    const tableName = role === "student" ? "students" : "companies";

    // Check if email already exists
    const [existing] = await pool.query(`SELECT * FROM ${tableName} WHERE email=?`, [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with 'Pending' status
    if (role === "student") {
      await pool.query(
        "INSERT INTO students (name, email, password_hash, status) VALUES (?, ?, ?, 'Pending')",
        [name, email, hashedPassword]
      );
    } else {
      await pool.query(
        "INSERT INTO companies (name, email, password_hash, status) VALUES (?, ?, ?, 'Pending')",
        [name, email, hashedPassword]
      );
    }

    res.status(201).json({ message: "Registration successful. Please wait for admin approval." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
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

    // Check account status if applicable
    if (user.status === "Pending") {
      return res.status(403).json({ message: "Your account is pending approval." });
    }
    if (user.status === "Blocked") {
      return res.status(403).json({ message: "Your account has been blocked." });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user[userIdField], role: roleName },
      process.env.JWT_SECRET,
      { expiresIn: "10h" } // Token expires in 10 hours
    );

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
    res.status(500).json({ message: "Server error" });
  }
});

export default router;