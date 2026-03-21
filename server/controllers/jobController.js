import { pool } from "../config/db.js";

// GET all jobs with pagination and filtering
export const getJobs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const department = req.query.department;

    let query = `
      SELECT jobs.*, companies.name as company_name
      FROM jobs
      JOIN companies ON jobs.company_id = companies.id
      WHERE 1=1
    `;
    let countQuery = "SELECT COUNT(*) as total FROM jobs WHERE 1=1";
    let params = [];

    if (department) {
      query += " AND jobs.department = ?";
      countQuery += " AND department = ?";
      params.push(department);
    }

    if (req.user?.role === 'student' && req.user.id) {
      const [[student]] = await pool.query("SELECT branch, cgpa FROM students WHERE id = ?", [req.user.id]);
      
      if (student) {
        // Evaluate eligibility parameters
        query += ` AND (jobs.eligible_branches IS NULL OR JSON_LENGTH(jobs.eligible_branches) = 0 OR JSON_CONTAINS(jobs.eligible_branches, ?))`;
        countQuery += ` AND (jobs.eligible_branches IS NULL OR JSON_LENGTH(jobs.eligible_branches) = 0 OR JSON_CONTAINS(jobs.eligible_branches, ?))`;
        params.push(`"${student.branch || ''}"`);

        query += ` AND (jobs.min_cgpa <= ?)`;
        countQuery += ` AND (jobs.min_cgpa <= ?)`;
        params.push(student.cgpa || 0);

        query += ` AND (jobs.allowed_backlogs IS NULL OR jobs.allowed_backlogs >= ?)`;
        countQuery += ` AND (jobs.allowed_backlogs IS NULL OR jobs.allowed_backlogs >= ?)`;
        params.push(student.backlogs || 0);
      }
      
      // Filter out expired jobs
      query += ` AND jobs.deadline >= CURRENT_DATE()`;
      countQuery += ` AND jobs.deadline >= CURRENT_DATE()`;
    }

    query += " ORDER BY jobs.created_at DESC LIMIT ? OFFSET ?";
    
    const [rows] = await pool.query(query, [...params, limit, offset]);
    const [[{ total }]] = await pool.query(countQuery, params);

    const data = {
      jobs: rows,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalJobs: total
    };

    if (res.sendResponse) return res.sendResponse(data, "Jobs fetched successfully");
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};


// io removed from here, now accessed via req.io

// POST new job (company posts job)
export const postJob = async (req, res, next) => {
  try {
    const {
      company_id,
      title,
      description,
      department,
      deadline,
      ctc,
      min_cgpa,
      allowed_backlogs,
      eligible_branches,
      location,
      type,
      skills,
      experience
    } = req.body;

    if (req.user?.role !== "company") {
      return res.status(403).json({ success: false, message: "Only companies can post jobs" });
    }

    const actual_company_id = req.user.id;

    const [result] = await pool.query(
      `INSERT INTO jobs
       (company_id, title, description, department, deadline, ctc, min_cgpa, allowed_backlogs, eligible_branches, location, type, skills, experience)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [actual_company_id, title, description, department, deadline, ctc, min_cgpa || 0, allowed_backlogs || 0, JSON.stringify(eligible_branches || []), location, type, skills, experience]
    );

    const newJob = {
        id: result.insertId,
        company_id: actual_company_id,
        title,
        description,
        department,
        deadline,
        ctc,
        min_cgpa: min_cgpa || 0,
        allowed_backlogs: allowed_backlogs || 0,
        eligible_branches: eligible_branches || [],
        location,
        type,
        skills,
        experience,
        created_at: new Date()
    };

    // Emit real-time event to students
    if (req.io) {
      req.io.to("students").emit("newJobPosted", newJob);
    }

    if (res.sendResponse) return res.sendResponse({ job_id: result.insertId }, "Job posted successfully", 201);

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      data: { job_id: result.insertId, job: newJob }
    });

  } catch (error) {
    next(error);
  }
};