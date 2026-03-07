import express from "express";
import { pool } from "../config/db.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check student
    const [students] = await pool.query(
      "SELECT * FROM students WHERE email=?",
      [email]
    );

    if (students.length > 0) {
      const student = students[0];

      if (password === student.password_hash) {
        return res.json({
          message: "Login successful",
          role: "student",
        });
      }
    }

    // Check company
    const [companies] = await pool.query(
      "SELECT * FROM companies WHERE email=?",
      [email]
    );

    if (companies.length > 0) {
      const company = companies[0];

      if (password === company.password_hash) {
        return res.json({
          message: "Login successful",
          role: "company",
        });
      }
    }

    // Admin login (temporary hardcoded)
    if (email === "admin@pms.com" && password === "admin123") {
      return res.json({
        message: "Login successful",
        role: "admin",
      });
    }

    res.status(401).json({
      message: "Invalid email or password",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
});

export default router;