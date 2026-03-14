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
      `INSERT INTO students (name, email, password_hash, approved, status) VALUES (?, ?, ?, 0, 'Pending')`,
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

// Get student profile — returns ALL fields including profile wizard columns
export const getStudentProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT user_id, name, email, first_name, last_name, dob, gender, college, degree,
              cgpa, backlogs, skills, projects, internships, resume_url, profile_photo_url, status
       FROM students WHERE user_id = ?`,
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ message: "Student not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update student profile — accepts all profile wizard fields
export const updateStudentProfile = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    first_name, firstName,
    last_name, lastName,
    dob,
    gender,
    college,
    degree,
    cgpa,
    skills,
    projects,
    internships,
    resume_url,
    profile_photo_url
  } = req.body;

  // Support both snake_case and camelCase from frontend
  const finalFirstName = first_name || firstName || null;
  const finalLastName = last_name || lastName || null;
  const finalName = name || (finalFirstName && finalLastName ? `${finalFirstName} ${finalLastName}` : null);

  try {
    // Build dynamic SET clause — only update fields that were provided
    const updates = [];
    const values = [];

    if (finalName !== null && finalName !== undefined) { updates.push("name = ?"); values.push(finalName); }
    if (finalFirstName !== null) { updates.push("first_name = ?"); values.push(finalFirstName); }
    if (finalLastName !== null) { updates.push("last_name = ?"); values.push(finalLastName); }
    if (dob !== undefined) { updates.push("dob = ?"); values.push(dob); }
    if (gender !== undefined) { updates.push("gender = ?"); values.push(gender); }
    if (college !== undefined) { updates.push("college = ?"); values.push(college); }
    if (degree !== undefined) { updates.push("degree = ?"); values.push(degree); }
    if (cgpa !== undefined) { updates.push("cgpa = ?"); values.push(cgpa); }
    if (skills !== undefined) { updates.push("skills = ?"); values.push(skills); }
    if (projects !== undefined) { updates.push("projects = ?"); values.push(projects); }
    if (internships !== undefined) { updates.push("internships = ?"); values.push(JSON.stringify(internships)); }
    if (resume_url !== undefined) { updates.push("resume_url = ?"); values.push(resume_url); }
    if (profile_photo_url !== undefined) { updates.push("profile_photo_url = ?"); values.push(profile_photo_url); }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(id);
    const [result] = await pool.query(
      `UPDATE students SET ${updates.join(", ")} WHERE user_id = ?`,
      values
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