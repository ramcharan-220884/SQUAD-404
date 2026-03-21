import { pool } from "../config/db.js";

export const fetchAllInterviews = async () => {
  const [rows] = await pool.query("SELECT * FROM interviews ORDER BY date ASC");
  return rows;
};

export const createInterviewRecord = async ({ company, role, date, round }) => {
  const [result] = await pool.query(
    "INSERT INTO interviews (company, role, date, round) VALUES (?, ?, ?, ?)",
    [company, role, date, round]
  );
  return result.insertId;
};

export const updateInterviewById = async (id, { company, role, date, round }) => {
  await pool.query(
    "UPDATE interviews SET company = ?, role = ?, date = ?, round = ? WHERE id = ?",
    [company, role, date, round, id]
  );
};

export const deleteInterviewById = async (id) => {
  await pool.query("DELETE FROM interviews WHERE id = ?", [id]);
};
