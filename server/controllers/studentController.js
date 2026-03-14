import { pool } from "../config/db.js";
import bcrypt from "bcrypt";

// Register new student
export const registerStudent = async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required" });
  }

  try {
    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT * FROM students WHERE email = ?",
      [email]
    );
    if (existing.length > 0) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Insert into DB with approved = false
    const [result] = await pool.query(
      `INSERT INTO students (name, email, password_hash, approved) VALUES (?, ?, ?, false)`,
      [name, email, hash]
    );

    res.status(201).json({ message: "Student registered successfully, pending approval", userId: result.insertId });
  } catch (err) {
    next(err);
  }
};

// Login student
export const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const [rows] = await pool.query("SELECT * FROM students WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ message: "Invalid credentials" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    // Login logic moved to authRoutes for JWT handling
    res.json({ message: "Use /api/auth/login for token-based authentication", userId: user.user_id, name: user.name });
  } catch (err) {
    next(err);
  }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT user_id, name, email, cgpa, skills, projects, internships, resume_url FROM students WHERE user_id = ?",
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
  const { id } = req.params;
  const { name, cgpa, skills, projects } = req.body;
  
  try {
    const [result] = await pool.query(
      "UPDATE students SET name = ?, cgpa = ?, skills = ?, projects = ? WHERE user_id = ?",
      [name, cgpa, skills, projects, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};