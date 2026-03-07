import { pool } from "../config/db.js";

// Get profile by user id
export const getProfile = async (req, res) => {
  const userId = req.user.id; // Assuming JWT middleware sets req.user
  try {
    const [rows] = await pool.query("SELECT name,email,cgpa,skills,projects,resume FROM students WHERE user_id=?", [userId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, cgpa, skills, projects, resume } = req.body;
  try {
    await pool.query(
      "UPDATE students SET name=?, email=?, cgpa=?, skills=?, projects=?, resume=? WHERE user_id=?",
      [name, email, cgpa, skills, projects, resume, userId]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};