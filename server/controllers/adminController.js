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
    const [companies] = await pool.query("SELECT company_id as id, name, 'Company' as role, status FROM companies");
    res.json([...students, ...companies]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user status
export const updateUserStatus = async (req, res) => {
  const { userId, status, role } = req.body;
  try {
    if (role === 'Student') {
      await pool.query("UPDATE students SET status=? WHERE user_id=?", [status, userId]);
    } else if (role === 'Company') {
      await pool.query("UPDATE companies SET status=? WHERE company_id=?", [status, userId]);
    } else {
      // Fallback
      await pool.query("UPDATE students SET status=? WHERE user_id=?", [status, userId]);
      await pool.query("UPDATE companies SET status=? WHERE company_id=?", [status, userId]);
    }
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

// Fetch pending users
export const getPendingUsers = async (req, res) => {
  try {
    const [students] = await pool.query(
      "SELECT user_id as id, name, email, created_at, 'student' as type FROM students WHERE status = 'Pending'"
    );

    const [companies] = await pool.query(
      "SELECT company_id as id, name, email, created_at, 'company' as type FROM companies WHERE status = 'Pending'"
    );

    res.json([...students, ...companies]);
  } catch (err) {
    console.error("Error fetching pending users:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve user
export const approveUser = async (req, res) => {
  const { id, type } = req.body;

  if (!id || !type) {
    return res.status(400).json({ message: "ID and type are required" });
  }

  try {
    let result;
    if (type === "student") {
      [result] = await pool.query(
        "UPDATE students SET status = 'Active' WHERE user_id = ?",
        [id]
      );
    } else if (type === "company") {
      [result] = await pool.query(
        "UPDATE companies SET status = 'Active' WHERE company_id = ?",
        [id]
      );
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found or already verified" });
    }

    res.json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} approved successfully` });
  } catch (err) {
    console.error("Error approving user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject (Delete) user
export const rejectUser = async (req, res) => {
  const { id, type } = req.body;

  if (!id || !type) {
    return res.status(400).json({ message: "ID and type are required" });
  }

  try {
    let result;
    if (type === "student") {
      [result] = await pool.query("DELETE FROM students WHERE user_id = ?", [id]);
    } else if (type === "company") {
      [result] = await pool.query("DELETE FROM companies WHERE company_id = ?", [id]);
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `${type.charAt(0).toUpperCase() + type.slice(1)} registration rejected and data removed.` });
  } catch (err) {
    console.error("Error rejecting user:", err);
    res.status(500).json({ message: "Server error" });
  }
};