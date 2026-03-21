import { pool } from "../config/db.js";

export const fetchAllEvents = async () => {
  const [rows] = await pool.query(`
    SELECT e.*, COUNT(er.student_id) as registered_count 
    FROM events e 
    LEFT JOIN event_registrations er ON e.id = er.event_id 
    GROUP BY e.id 
    ORDER BY e.date ASC
  `);
  return rows;
};

export const createEventRecord = async ({ title, date, type, description }) => {
  const [result] = await pool.query(
    "INSERT INTO events (title, date, type, description) VALUES (?, ?, ?, ?)",
    [title, date, type, description]
  );
  return result.insertId;
};

export const updateEventById = async (id, { title, date, type, description }) => {
  await pool.query(
    "UPDATE events SET title = ?, date = ?, type = ?, description = ? WHERE id = ?",
    [title, date, type, description, id]
  );
};

export const deleteEventById = async (id) => {
  await pool.query("DELETE FROM events WHERE id = ?", [id]);
};
