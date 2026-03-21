import { pool } from "../config/db.js";

export const fetchAllAssessments = async () => {
  const [rows] = await pool.query("SELECT * FROM assessments ORDER BY deadline ASC");
  return rows;
};

export const createAssessmentRecord = async ({ title, duration, deadline, description }) => {
  const [result] = await pool.query(
    "INSERT INTO assessments (title, duration, deadline, description) VALUES (?, ?, ?, ?)",
    [title, duration, deadline, description || '']
  );
  return result.insertId;
};

export const updateAssessmentById = async (id, { title, duration, deadline, description }) => {
  await pool.query(
    "UPDATE assessments SET title = ?, duration = ?, deadline = ?, description = ? WHERE id = ?",
    [title, duration, deadline, description, id]
  );
};

export const deleteAssessmentById = async (id) => {
  await pool.query("DELETE FROM assessments WHERE id = ?", [id]);
};

export const fetchAssessmentAttempts = async (assessment_id, { page = 1, limit = 10, evaluation_status, search }) => {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const parsedLimit = parseInt(limit);

  let baseQuery = `
    FROM assessment_attempts aa
    JOIN students s ON aa.student_id = s.id
    WHERE aa.assessment_id = ?
  `;
  const params = [assessment_id];

  if (evaluation_status) {
    if (evaluation_status === 'Pending') {
      baseQuery += ` AND (aa.evaluation_status IS NULL OR aa.evaluation_status = 'Pending')`;
    } else {
      baseQuery += ` AND aa.evaluation_status = ?`;
      params.push(evaluation_status);
    }
  }

  if (search) {
    baseQuery += ` AND (s.name LIKE ? OR s.email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total ${baseQuery}`, params);

  const [attempts] = await pool.query(`
    SELECT 
      s.id AS student_id, s.name, s.email, s.branch,
      aa.score, aa.status,
      COALESCE(aa.evaluation_status, 'Pending') AS evaluation_status,
      aa.completed_at
    ${baseQuery}
    ORDER BY aa.completed_at DESC
    LIMIT ? OFFSET ?
  `, [...params, parsedLimit, offset]);

  return { attempts, total, page: parseInt(page), limit: parsedLimit };
};
