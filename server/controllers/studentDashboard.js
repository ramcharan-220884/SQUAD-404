import { pool } from "../config/db.js";

// Fetch applied jobs for logged-in student
export const getAppliedJobs = async (req, res) => {
  const userId = req.user.id; // From JWT middleware
  try {
    const [rows] = await pool.query(
      `SELECT j.id, j.title, j.company, j.ctc, a.status, j.drive_date, j.upcoming
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       WHERE a.student_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};