import { pool } from "../config/db.js";

// Get analytics stats
export const getStats = async (req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query("SELECT COUNT(*) as totalStudents FROM students");
    const [[{ placedStudents }]] = await pool.query("SELECT COUNT(*) as placedStudents FROM applications WHERE status='Selected'");
    const [[{ activeCompanies }]] = await pool.query("SELECT COUNT(*) as activeCompanies FROM companies WHERE status='Active'");
    res.json({ totalStudents, placedStudents, activeCompanies });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users (students + companies)
export const getUsers = async (req, res) => {
  try {
    const [students] = await pool.query("SELECT user_id as id, name, 'Student' as role, status FROM students");
    const [companies] = await pool.query("SELECT user_id as id, name, 'Company' as role, status FROM companies");
    res.json([...students, ...companies]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  const { userId, status } = req.body;
  try {
    await pool.query("UPDATE students SET status=? WHERE user_id=?", [status, userId]);
    await pool.query("UPDATE companies SET status=? WHERE user_id=?", [status, userId]);
    res.json({ message: "User status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Send notification (simplified)
export const sendNotification = async (req, res) => {
  const { message } = req.body;
  try {
    // Save notification in DB or send email logic
    await pool.query("INSERT INTO notifications (message) VALUES (?)", [message]);
    res.json({ message: "Notification sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};