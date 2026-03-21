import { pool } from "../config/db.js";

export const getAnnouncements = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM announcements ORDER BY is_pinned DESC, start_date DESC");
    if (res.sendResponse) return res.sendResponse(rows, "Announcements fetched successfully");
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, audience, start_date, expiry_date, is_pinned } = req.body;
    const query = `INSERT INTO announcements (title, content, category, audience, start_date, expiry_date, is_pinned) 
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const [result] = await pool.query(query, [title, content, category, audience, start_date, expiry_date, is_pinned || false]);
    
    if (res.sendResponse) return res.sendResponse({ id: result.insertId }, "Announcement created");
    res.json({ success: true, message: "Announcement created", data: { id: result.insertId } });
  } catch (err) {
    next(err);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM announcements WHERE id = ?", [id]);
    if (res.sendResponse) return res.sendResponse(null, "Announcement deleted");
    res.json({ success: true, message: "Announcement deleted" });
  } catch (err) {
    next(err);
  }
};
