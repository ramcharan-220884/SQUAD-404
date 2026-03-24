import { pool } from "../config/db.js";

export const fetchAllCompetitions = async () => {
  const [rows] = await pool.query(`
    SELECT c.*, s.name as creator_name, COUNT(cr.student_id) as registered_count 
    FROM competitions c 
    LEFT JOIN students s ON c.createdBy = s.id
    LEFT JOIN competition_registrations cr ON c.id = cr.competition_id 
    GROUP BY c.id 
    ORDER BY c.created_at DESC
  `);
  return rows;
};

export const fetchApprovedCompetitions = async (studentId) => {
  const [rows] = await pool.query(`
    SELECT c.*, 
           CASE WHEN cr.id IS NOT NULL THEN 1 ELSE 0 END as registered
    FROM competitions c
    LEFT JOIN competition_registrations cr ON cr.competition_id = c.id AND cr.student_id = ?
    WHERE c.status = 'approved' AND c.date >= CURDATE()
    ORDER BY c.date ASC
  `, [studentId]);
  
  return rows.map(r => ({ ...r, registered: r.registered === 1 }));
};

export const createCompetitionRecord = async ({ title, description, date, category, registrationLink, createdBy, status }) => {
  const [result] = await pool.query(
    "INSERT INTO competitions (title, description, date, category, registrationLink, createdBy, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title, description, date, category || 'Hackathon', registrationLink || '', createdBy || null, status || 'pending']
  );
  return { id: result.insertId, title, description, date, category, registrationLink, createdBy, status: status || 'pending' };
};

export const updateCompetitionById = async (id, { title, description, date, category, registrationLink, status }) => {
  await pool.query(
    "UPDATE competitions SET title = ?, description = ?, date = ?, category = ?, registrationLink = ?, status = ? WHERE id = ?",
    [title, description, date, category, registrationLink, status, id]
  );
};

export const updateCompetitionStatus = async (id, status) => {
  await pool.query("UPDATE competitions SET status = ? WHERE id = ?", [status, id]);
};

export const deleteCompetitionById = async (id) => {
  await pool.query("DELETE FROM competitions WHERE id = ?", [id]);
};
