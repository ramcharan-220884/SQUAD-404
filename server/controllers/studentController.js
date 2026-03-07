import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// Register new student
export const registerStudent = async (req, res) => {
  const { name, email, password, cgpa, backlogs } = req.body;

  try {
    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );
    if (existing.length > 0) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert into DB
    const [result] = await pool.query(
      `INSERT INTO students (name, email, password_hash, cgpa, backlogs, status) VALUES (?, ?, ?, ?, ?, 'Pending')`,
      [name, email, hash, cgpa, backlogs]
    );

    res.status(201).json({ message: "Student registered successfully", userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Login student
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM students WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ message: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    // You can add JWT token here later for auth
    res.json({ message: "Login successful", userId: user.user_id, name: user.name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};