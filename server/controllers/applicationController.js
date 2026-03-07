import { pool } from "../config/db.js";

// Student applies for job
export const applyJob = async (req, res) => {
  try {
    const { student_id, job_id } = req.body;

    const [existing] = await pool.query(
      "SELECT * FROM applications WHERE student_id=? AND job_id=?",
      [student_id, job_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "You already applied for this job"
      });
    }

    await pool.query(
      "INSERT INTO applications (job_id, student_id) VALUES (?, ?)",
      [job_id, student_id]
    );

    res.json({ message: "Application submitted successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error applying job" });
  }
};


// Company views applicants for a job
export const getApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const [rows] = await pool.query(
      `SELECT 
        students.user_id,
        students.name,
        students.email,
        applications.status,
        applications.applied_at
      FROM applications
      JOIN students ON applications.student_id = students.user_id
      WHERE applications.job_id=?`,
      [jobId]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching applicants" });
  }
};

export const getStudentApplications = async (req, res) => {
  try {

    const { student_id } = req.params;

    const [rows] = await pool.query(
      `SELECT applications.*, jobs.title, jobs.ctc, companies.name AS company_name
       FROM applications
       JOIN jobs ON applications.job_id = jobs.job_id
       JOIN companies ON jobs.company_id = companies.company_id
       WHERE applications.student_id = ?`,
      [student_id]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching applications" });
  }
};

export const getJobApplicants = async (req, res) => {
  try {

    const { job_id } = req.params;

    const [rows] = await pool.query(
      `SELECT applications.*, students.name, students.email
       FROM applications
       JOIN students ON applications.student_id = students.student_id
       WHERE applications.job_id = ?`,
      [job_id]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching applicants" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {

    const application_id = req.params.application_id;
    const { status } = req.body;

    const [result] = await pool.query(
      "UPDATE applications SET status = ? WHERE application_id = ?",
      [status, application_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Application not found"
      });
    }

    res.json({
      message: "Application status updated"
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({
      message: "Server error while updating status"
    });

  }
};