import { pool } from "../config/db.js";

// Get aggregated pending submissions
export const getPendingSubmissions = async (req, res, next) => {
  try {
    const [events] = await pool.query(`
      SELECT e.id, e.title, e.description, e.date, e.type as category, NULL as link, 'event' as submission_type, s.name as student_name, e.status, e.created_at 
      FROM events e JOIN students s ON e.submitted_by = s.id WHERE e.status = 'pending'
    `);
    
    const [competitions] = await pool.query(`
      SELECT c.id, c.title, c.description, c.date, c.category, c.registrationLink as link, 'competition' as submission_type, s.name as student_name, c.status, c.created_at 
      FROM competitions c JOIN students s ON c.createdBy = s.id WHERE c.status = 'pending'
    `);
    
    const [resources] = await pool.query(`
      SELECT r.id, r.title, '' as description, NULL as date, r.category, r.link, r.branch, 'resource' as submission_type, s.name as student_name, r.status, r.created_at 
      FROM student_resources r JOIN students s ON r.submitted_by = s.id WHERE r.status = 'pending'
    `);

    // Combine and sort oldest first for processing queue
    const pendingItems = [...events, ...competitions, ...resources].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    
    res.json({ success: true, data: pendingItems });
  } catch (err) {
    next(err);
  }
};

// Approve submission
export const approveSubmission = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const admin_id = req.user.id;
    let tableName;

    if (type === 'event') tableName = 'events';
    else if (type === 'competition') tableName = 'competitions';
    else if (type === 'resource') tableName = 'student_resources';

    const [result] = await pool.query(
      `UPDATE ${tableName} SET status = 'approved', reviewed_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'`,
      [admin_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Submission not found or already processed" });
    }

    res.json({ success: true, message: `${type} approved successfully` });
  } catch (err) {
    next(err);
  }
};

// Reject submission
export const rejectSubmission = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const admin_id = req.user.id;
    let tableName;

    if (type === 'event') tableName = 'events';
    else if (type === 'competition') tableName = 'competitions';
    else if (type === 'resource') tableName = 'student_resources';

    const [result] = await pool.query(
      `UPDATE ${tableName} SET status = 'rejected', reviewed_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending'`,
      [admin_id, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Submission not found or already processed" });
    }

    res.json({ success: true, message: `${type} rejected successfully` });
  } catch (err) {
    next(err);
  }
};
