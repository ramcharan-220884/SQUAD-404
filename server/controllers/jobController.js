import { pool } from "../config/db.js";

// GET all jobs
export const getJobs = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT jobs.*, companies.name AS company_name
      FROM jobs
      JOIN companies ON jobs.company_id = companies.company_id
      ORDER BY jobs.created_at DESC
    `);

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching jobs" });
  }
};


// POST new job (company posts job)
export const postJob = async (req, res) => {

  try {

    const {
      company_id,
      title,
      description,
      ctc,
      min_cgpa,
      max_backlogs
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO jobs
       (company_id, title, description, ctc, min_cgpa, max_backlogs)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        company_id,
        title,
        description,
        ctc,
        min_cgpa,
        max_backlogs
      ]
    );

    res.json({
      message: "Job posted successfully",
      job_id: result.insertId
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Error posting job" });

  }
};