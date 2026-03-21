import { pool } from "../config/db.js";

export const getSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM settings LIMIT 1");
    const settings = rows[0] || {};
    if (res.sendResponse) return res.sendResponse(settings, "Settings fetched successfully");
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { system_name, college_name, admin_email, contact_number, notifications_config, permissions_config } = req.body;
    
    // Check if row exists
    const [existing] = await pool.query("SELECT id FROM settings LIMIT 1");
    if (existing.length === 0) {
      await pool.query(
        "INSERT INTO settings (system_name, college_name, admin_email, contact_number, notifications_config, permissions_config) VALUES (?, ?, ?, ?, ?, ?)",
        [system_name, college_name, admin_email, contact_number, JSON.stringify(notifications_config), JSON.stringify(permissions_config)]
      );
    } else {
      await pool.query(
        "UPDATE settings SET system_name=?, college_name=?, admin_email=?, contact_number=?, notifications_config=?, permissions_config=? WHERE id=?",
        [system_name, college_name, admin_email, contact_number, JSON.stringify(notifications_config), JSON.stringify(permissions_config), existing[0].id]
      );
    }

    if (res.sendResponse) return res.sendResponse(null, "Settings updated successfully");
    res.json({ success: true, message: "Settings updated successfully" });
  } catch (err) {
    next(err);
  }
};
