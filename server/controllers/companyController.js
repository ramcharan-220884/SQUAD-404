import { pool } from "../config/db.js";

// Get announcements visible to company/recruiter role
export const getCompanyAnnouncements = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM announcements WHERE audience IN ('All', 'Recruiters') ORDER BY is_pinned DESC, created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};


// Update company profile fields
export const updateJobDetails = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { role, package: pkg, eligibility_cgpa, deadline, description, dark_mode, name, contact_person, contact_number } = req.body;

    let query = "UPDATE companies SET ";
    const params = [];
    const fields = [];

    if (name !== undefined) { fields.push("name = ?"); params.push(name); }
    if (role !== undefined) { fields.push("role = ?"); params.push(role); }
    if (pkg !== undefined) { fields.push("package = ?"); params.push(pkg); }
    if (eligibility_cgpa !== undefined) { fields.push("eligibility_cgpa = ?"); params.push(eligibility_cgpa); }
    if (deadline !== undefined) { fields.push("deadline = ?"); params.push(deadline); }
    if (description !== undefined) { fields.push("description = ?"); params.push(description); }
    if (dark_mode !== undefined) { fields.push("dark_mode = ?"); params.push(dark_mode); }
    if (contact_person !== undefined) { fields.push("contact_person = ?"); params.push(contact_person); }
    if (contact_number !== undefined) { fields.push("contact_number = ?"); params.push(contact_number); }

    if (fields.length === 0) return res.json({ success: true, message: "No fields to update" });

    query += fields.join(", ") + " WHERE id = ?";
    params.push(id);

    await pool.query(query, params);

    res.json({ success: true, message: "Company profile updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Get current company details (profile)
export const getMyCompanyDetails = async (req, res, next) => {
  try {
    const id = req.user.id;
    const [rows] = await pool.query("SELECT * FROM companies WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: "Company not found" });
    
    const company = rows[0];
    delete company.password;
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
};

// Get all jobs posted by this company (with applicant counts)
export const getCompanyJobs = async (req, res, next) => {
  try {
    const company_id = req.user.id;

    const [jobs] = await pool.query(
      `SELECT j.*, COUNT(a.id) AS applicant_count
       FROM jobs j
       LEFT JOIN applications a ON j.id = a.job_id
       WHERE j.company_id = ?
       GROUP BY j.id
       ORDER BY j.created_at DESC`,
      [company_id]
    );

    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
};

// Get all applicants across all of this company's jobs (with pagination & filters)
export const getCompanyApplicants = async (req, res, next) => {
  try {
    const company_id = req.user.id;
    const { page = 1, limit = 10, job_id, status, search } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const parsedLimit = parseInt(limit);

    let baseQuery = `
       FROM applications a
       JOIN jobs j ON a.job_id = j.id
       JOIN students s ON a.student_id = s.id
       WHERE j.company_id = ?
    `;
    const params = [company_id];

    if (job_id) {
      baseQuery += ` AND a.job_id = ?`;
      params.push(job_id);
    }
    
    if (status) {
      baseQuery += ` AND a.status = ?`;
      params.push(status);
    }

    if (search) {
      baseQuery += ` AND s.name LIKE ?`;
      params.push(`%${search}%`);
    }

    // 1. Get total count for pagination metadata
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total ${baseQuery}`, params);

    // 2. Fetch paginated data
    const query = `
      SELECT 
         a.id AS application_id,
         a.student_id,
         a.job_id,
         a.status,
         a.applied_at,
         a.resume_url,
         s.name AS student_name,
         s.email AS student_email,
         s.branch,
         s.cgpa,
         j.title AS job_title
      ${baseQuery}
      ORDER BY a.applied_at DESC
      LIMIT ? OFFSET ?
    `;
    
    // Add limit and offset to params for data query
    const dataParams = [...params, parsedLimit, offset];

    const [applicants] = await pool.query(query, dataParams);

    res.json({ 
      success: true, 
      data: applicants,
      pagination: {
        total,
        page: parseInt(page),
        limit: parsedLimit,
        totalPages: Math.ceil(total / parsedLimit)
      }
    });
  } catch (err) {
    next(err);
  }
};

// Update application status (company validates ownership)
export const updateCompanyApplicationStatus = async (req, res, next) => {
  try {
    const company_id = req.user.id;
    const { applicationId, status } = req.body;

    if (!applicationId || !status) {
      return res.status(400).json({ success: false, message: "applicationId and status are required" });
    }

    const validStatuses = ['Applied', 'Shortlisted', 'Rejected', 'Selected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    // Verify app belongs to this company's job
    const [[app]] = await pool.query(
      `SELECT a.id, a.student_id, j.company_id 
       FROM applications a 
       JOIN jobs j ON a.job_id = j.id 
       WHERE a.id = ? AND j.company_id = ?`,
      [applicationId, company_id]
    );

    if (!app) {
      return res.status(403).json({ success: false, message: "Application not found or unauthorized" });
    }

    await pool.query("UPDATE applications SET status = ? WHERE id = ?", [status, applicationId]);

    // If selected, update student placed_status
    if (status === 'Selected') {
      await pool.query("UPDATE students SET placed_status = 'Placed' WHERE id = ?", [app.student_id]);
    }

    // Notify student via socket
    const [[appData]] = await pool.query(
      "SELECT a.student_id, j.title as jobTitle FROM applications a JOIN jobs j ON a.job_id = j.id WHERE a.id = ?",
      [applicationId]
    );
    if (appData && req.io) {
      req.io.to(`student_${appData.student_id}`).emit("applicationStatusUpdated", {
        applicationId,
        status,
        jobTitle: appData.jobTitle
      });
    }

    res.json({ success: true, message: "Application status updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Company Stats — fully dynamic
export const getCompanyStats = async (req, res, next) => {
  try {
    const id = req.user.id;
    const [[{ totalJobs }]] = await pool.query("SELECT COUNT(*) as totalJobs FROM jobs WHERE company_id = ?", [id]);
    const [[{ totalApplications }]] = await pool.query("SELECT COUNT(*) as totalApplications FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = ?", [id]);
    const [[{ studentsReached }]] = await pool.query("SELECT COUNT(DISTINCT a.student_id) as studentsReached FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = ?", [id]);
    const [[{ selectedCount }]] = await pool.query("SELECT COUNT(*) as selectedCount FROM applications a JOIN jobs j ON a.job_id = j.id WHERE j.company_id = ? AND a.status = 'Selected'", [id]);
    
    res.json({
      success: true,
      data: {
        totalJobs,
        totalApplications,
        studentsReached,
        selectedCount,
        placementRate: totalApplications > 0 ? ((selectedCount / totalApplications) * 100).toFixed(1) + "%" : "0%"
      }
    });
  } catch (err) {
    next(err);
  }
};