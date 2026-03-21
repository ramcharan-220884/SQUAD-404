import { pool } from "../config/db.js";

export const createSupportTicket = async (req, res, next) => {
  try {
    const { title, category, description, attachment_url } = req.body;
    const reporter_id = req.user?.id || null;

    const query = `INSERT INTO support_tickets (title, category, description, attachment_url, reporter_id) 
                   VALUES (?, ?, ?, ?, ?)`;
    
    await pool.query(query, [title, category, description, attachment_url, reporter_id]);
    
    if (res.sendResponse) return res.sendResponse(null, "Support ticket created successfully");
    res.json({ success: true, message: "Support ticket created successfully" });
  } catch (err) {
    next(err);
  }
};
