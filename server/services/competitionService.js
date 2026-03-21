import { pool } from "../config/db.js";

export const fetchAllCompetitions = async () => {
  const [rows] = await pool.query(`
    SELECT c.*, COUNT(cr.student_id) as registered_count 
    FROM competitions c 
    LEFT JOIN competition_registrations cr ON c.id = cr.competition_id 
    GROUP BY c.id 
    ORDER BY c.created_at DESC
  `);
  return rows;
};

export const createCompetitionRecord = async ({ title, deadline, prize, status, description }) => {
  const [result] = await pool.query(
    "INSERT INTO competitions (title, deadline, prize, status, description) VALUES (?, ?, ?, ?, ?)",
    [title, deadline, prize, status || 'Open', description || '']
  );
  return { id: result.insertId, title, deadline, prize, status: status || 'Open', description };
};

export const updateCompetitionById = async (id, { title, deadline, prize, status, description }) => {
  await pool.query(
    "UPDATE competitions SET title = ?, deadline = ?, prize = ?, status = ?, description = ? WHERE id = ?",
    [title, deadline, prize, status, description, id]
  );
};

export const deleteCompetitionById = async (id) => {
  await pool.query("DELETE FROM competitions WHERE id = ?", [id]);
};
