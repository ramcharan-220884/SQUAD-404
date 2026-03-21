import { pool } from "../config/db.js";
// io removed from here, now accessed via req.io

// Student applies for job
export const applyJob = async (req, res) => {
  let connection;
  try {
    const job_id = req.params.jobId || req.body.job_id;
    const student_id = req.user?.id; // ALWAYS use authenticated user id — never trust req.body.student_id

    if (!job_id || !student_id) {
      return res.status(400).json({ success: false, message: "Missing job or student ID" });
    }

    // 1 & 2. Check Job and Deadline
    const [[job]] = await pool.query("SELECT * FROM jobs WHERE id = ?", [job_id]);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (new Date(job.deadline) < new Date(new Date().setHours(0,0,0,0))) {
      return res.status(400).json({ success: false, message: "Deadline has expired" });
    }

    // 3. Verify Eligibility
    const [[student]] = await pool.query("SELECT * FROM students WHERE id = ?", [student_id]);
    if (!student) return res.status(404).json({ success: false, message: "Student profile not found" });

    if (job.min_cgpa !== null && parseFloat(student.cgpa || 0) < parseFloat(job.min_cgpa)) {
      return res.status(400).json({ success: false, message: `Minimum CGPA required is ${job.min_cgpa}` });
    }
    if (job.allowed_backlogs !== null && parseInt(student.backlogs || 0) > parseInt(job.allowed_backlogs)) {
      return res.status(400).json({ success: false, message: `Maximum allowed backlogs is ${job.allowed_backlogs}` });
    }
    
    let eligibleBranches = job.eligible_branches;
    if (typeof eligibleBranches === 'string') {
      try { eligibleBranches = JSON.parse(eligibleBranches); } catch (e) {}
    }
    if (eligibleBranches && Array.isArray(eligibleBranches) && eligibleBranches.length > 0) {
      if (!eligibleBranches.includes(student.branch)) {
        return res.status(400).json({ success: false, message: "Your branch is not eligible for this job" });
      }
    }

    // 4. Transaction Start
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 5. Duplicate Check inside transaction (with FOR UPDATE to lock the row/gap)
    const [existing] = await connection.query(
      "SELECT id FROM applications WHERE student_id=? AND job_id=? FOR UPDATE",
      [student_id, job_id]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "You already applied for this job" });
    }

    // 6. Insert new application
    await connection.query(
      "INSERT INTO applications (job_id, student_id, resume_url) VALUES (?, ?, ?)",
      [job_id, student_id, student.resume_url]
    );

    await connection.commit();

    // Notify the company (outside transaction — non-critical)
    if (req.io) {
      req.io.to(`company_${job.company_id}`).emit("newApplicant", {
        jobId: job_id,
        jobTitle: job.title,
        studentName: student.name,
        studentId: student_id
      });
    }

    res.json({ success: true, message: "Application submitted successfully" });

  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch (_) {}
    }
    // Handle duplicate key violation from DB UNIQUE constraint gracefully
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: "You already applied for this job" });
    }
    console.error(error);
    res.status(500).json({ success: false, message: "Error applying for job" });
  } finally {
    if (connection) connection.release();
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
      JOIN students ON applications.student_id = students.id
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
    const student_id = req.user.role === 'student' ? req.user.id : parseInt(req.params.student_id);

    if (!student_id) {
      return res.status(400).json({ success: false, message: "Valid Student ID required." });
    }

    const [rows] = await pool.query(
      `SELECT 
        applications.*, 
        jobs.title, 
        jobs.ctc, 
        jobs.description, 
        jobs.location, 
        jobs.type, 
        jobs.skills, 
        jobs.experience, 
        jobs.eligible_branches, 
        jobs.deadline, 
        jobs.min_cgpa, 
        jobs.allowed_backlogs,
        companies.name as company_name
       FROM applications
       JOIN jobs ON applications.job_id = jobs.id
       JOIN companies ON jobs.company_id = companies.id
       WHERE applications.student_id = ?`,
      [student_id]
    );

    // Return consistent {success, data} format so frontend handleResponse works correctly
    res.json({ success: true, data: rows });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching applications" });
  }
};

export const getJobApplicants = async (req, res) => {
  try {
    const job_id = req.params.job_id || req.params.jobId;
    const company_id = req.user?.id;

    if (req.user?.role !== 'company' && req.user?.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Only companies or admins can view job applicants." });
    }

    if (req.user?.role === 'company') {
      const [[job]] = await pool.query("SELECT * FROM jobs WHERE id = ? AND company_id = ?", [job_id, company_id]);
      if (!job) return res.status(403).json({ success: false, message: "Unauthorized or job not found" });
    }

    const [rows] = await pool.query(
      `SELECT applications.*, students.name, students.email, students.resume_url, students.cgpa
       FROM applications
       JOIN students ON applications.student_id = students.id
       WHERE applications.job_id = ?`,
      [job_id]
    );

    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching applicants" });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const application_id = req.params.application_id;
    const { status } = req.body;
    const company_id = req.user?.id;

    if (req.user?.role !== 'company') {
      return res.status(403).json({ success: false, message: "Only companies allowed to update status" });
    }

    const [[app]] = await pool.query(
      `SELECT a.* FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = ? AND j.company_id = ?`,
      [application_id, company_id]
    );
    if (!app) return res.status(403).json({ success: false, message: "Unauthorized, application not found, or you don't own this job." });

    const validStatuses = ['Applied', 'Shortlisted', 'Rejected', 'Selected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const [result] = await pool.query(
      "UPDATE applications SET status = ? WHERE id = ?",
      [status, application_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (status === 'Selected') {
      await pool.query("UPDATE students SET placed_status = 'Placed' WHERE id = ?", [app.student_id]);
      // Optional: Insert into placements table if it exists
    }

    // Notify the student
    const [[appData]] = await pool.query(
        "SELECT a.student_id, j.title as jobTitle FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.id = ?", 
        [application_id]
    );
    if (appData && req.io) {
        req.io.to(`student_${appData.student_id}`).emit("applicationStatusUpdated", {
            applicationId: application_id,
            status,
            jobTitle: appData.jobTitle
        });
    }

    res.json({ success: true, message: "Application status updated" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while updating status" });
  }
};

export const withdrawApplication = async (req, res) => {
  try {
    const { application_id } = req.params;
    const student_id = req.user.id;

    // Check if application belongs to the student
    const [[app]] = await pool.query(
      "SELECT * FROM applications WHERE id = ? AND student_id = ?",
      [application_id, student_id]
    );

    if (!app) {
      return res.status(404).json({ success: false, message: "Application not found or unauthorized" });
    }

    await pool.query("DELETE FROM applications WHERE id = ?", [application_id]);

    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (error) {
    console.error("Error withdrawing application:", error);
    res.status(500).json({ success: false, message: "Server error while withdrawing application" });
  }
};