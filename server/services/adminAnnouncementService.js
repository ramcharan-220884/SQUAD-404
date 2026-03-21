import { pool } from "../config/db.js";

export const createAnnouncementRecord = async ({ title, content, category, audience, start_date, expiry_date, is_pinned }) => {
  const [result] = await pool.query(
    "INSERT INTO announcements (title, content, category, audience, start_date, expiry_date, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, content, category || 'Notice', audience || 'All Students', start_date, expiry_date, is_pinned ? 1 : 0]
  );
  return result.insertId;
};

export const updateAnnouncementById = async (id, { title, content, category, audience, start_date, expiry_date, is_pinned }) => {
  await pool.query(
    "UPDATE announcements SET title = ?, content = ?, category = ?, audience = ?, start_date = ?, expiry_date = ?, is_pinned = ? WHERE id = ?",
    [title, content, category, audience, start_date, expiry_date, is_pinned ? 1 : 0, id]
  );
};

export const deleteAnnouncementById = async (id) => {
  await pool.query("DELETE FROM announcements WHERE id = ?", [id]);
};
