import { pool } from "../config/db.js";
import * as competitionService from "../services/competitionService.js";

// Get student profile
export const getProfile = async (req, res, next) => {
  try {
    const id = req.user.id;
    const [rows] = await pool.query(
      `SELECT 
        id, name, email, first_name, last_name, dob, gender, college, degree, phone, country_code,
        skills, projects, internships, profile_photo_url, profile_completed,
        branch, cgpa, resume_url, placed_status, dark_mode, created_at,
        summary, location, specialization, edu_start_year, edu_end_year, tools_technologies, certifications
       FROM students WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
};

// Update student profile
export const updateProfile = async (req, res, next) => {
  try {
    const id = req.user.id;
    const { 
      name, first_name, last_name, dob, gender, college, degree, phone, country_code,
      skills, projects, internships, profile_photo_url, profile_completed,
      branch, cgpa, resume_url, dark_mode,
      summary, location, specialization, edu_start_year, edu_end_year, tools_technologies, certifications
    } = req.body;

    // Build the dynamic update query to handle partial updates (like from settings)
    const fields = [];
    const values = [];

    if (name !== undefined) { fields.push("name = ?"); values.push(name); }
    if (first_name !== undefined) { fields.push("first_name = ?"); values.push(first_name); }
    if (last_name !== undefined) { fields.push("last_name = ?"); values.push(last_name); }
    if (dob !== undefined) { fields.push("dob = ?"); values.push(dob); }
    if (gender !== undefined) { fields.push("gender = ?"); values.push(gender); }
    if (college !== undefined) { fields.push("college = ?"); values.push(college); }
    if (degree !== undefined) { fields.push("degree = ?"); values.push(degree); }
    if (phone !== undefined) { fields.push("phone = ?"); values.push(phone); }
    if (country_code !== undefined) { fields.push("country_code = ?"); values.push(country_code); }
    if (skills !== undefined) { 
        fields.push("skills = ?"); 
        values.push(typeof skills === 'object' ? JSON.stringify(skills) : skills); 
    }
    if (projects !== undefined) { 
        fields.push("projects = ?"); 
        values.push(typeof projects === 'object' ? JSON.stringify(projects) : projects); 
    }
    if (internships !== undefined) { 
        fields.push("internships = ?"); 
        values.push(typeof internships === 'object' ? JSON.stringify(internships) : internships); 
    }
    if (profile_photo_url !== undefined) { fields.push("profile_photo_url = ?"); values.push(profile_photo_url); }
    if (profile_completed !== undefined) { fields.push("profile_completed = ?"); values.push(profile_completed); }
    if (branch !== undefined) { fields.push("branch = ?"); values.push(branch); }
    if (cgpa !== undefined) { fields.push("cgpa = ?"); values.push(cgpa); }
    if (resume_url !== undefined) { fields.push("resume_url = ?"); values.push(resume_url); }
    if (dark_mode !== undefined) { fields.push("dark_mode = ?"); values.push(dark_mode); }
    if (summary !== undefined) { fields.push("summary = ?"); values.push(summary); }
    if (location !== undefined) { fields.push("location = ?"); values.push(location); }
    if (specialization !== undefined) { fields.push("specialization = ?"); values.push(specialization); }
    if (edu_start_year !== undefined) { fields.push("edu_start_year = ?"); values.push(edu_start_year); }
    if (edu_end_year !== undefined) { fields.push("edu_end_year = ?"); values.push(edu_end_year); }
    if (tools_technologies !== undefined) { fields.push("tools_technologies = ?"); values.push(tools_technologies); }
    if (certifications !== undefined) { fields.push("certifications = ?"); values.push(certifications); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update" });
    }

    values.push(id);
    await pool.query(
      `UPDATE students SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    next(err);
  }
};

// Get available companies (Jobs) - FIXED to query jobs table
export const getAvailableJobs = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    // Get all open jobs, and check if the student has already applied
    const [rows] = await pool.query(`
      SELECT 
        j.*, 
        c.name as company_name,
        CASE WHEN a.id IS NOT NULL THEN 1 ELSE 0 END as applied
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      LEFT JOIN applications a ON a.job_id = j.id AND a.student_id = ?
      WHERE j.deadline >= CURDATE() OR j.deadline IS NULL
    `, [student_id]);
    
    // Map applied boolean so React disables the button appropriately
    const formattedData = rows.map(r => ({ ...r, applied: r.applied === 1 }));
    res.json({ success: true, data: formattedData });
  } catch (err) {
    next(err);
  }
};

// Submit support ticket
export const submitTicket = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const role = req.user.role;
    const { subject, message, priority } = req.body;

    await pool.query(
      "INSERT INTO support_tickets (user_id, role, subject, message, priority) VALUES (?, ?, ?, ?, ?)",
      [user_id, role, subject, message, priority || 'Normal']
    );

    res.status(201).json({ success: true, message: "Support ticket submitted" });
  } catch (err) {
    next(err);
  }
};

// Withdraw application
export const withdrawApplication = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { id } = req.params;

    const [app] = await pool.query("SELECT id FROM applications WHERE id = ? AND student_id = ?", [id, student_id]);
    if (app.length === 0) {
      return res.status(404).json({ success: false, message: "Application not found or unauthorized" });
    }

    await pool.query("DELETE FROM applications WHERE id = ?", [id]);
    res.json({ success: true, message: "Application withdrawn successfully" });
  } catch (err) {
    next(err);
  }
};

// Get announcements with audience filtering
export const getAnnouncements = async (req, res, next) => {
  try {
    const role = req.user.role; // 'student' or 'company'
    const [rows] = await pool.query(
      "SELECT * FROM announcements WHERE audience IN ('All', 'All Students', ?) ORDER BY created_at DESC",
      [role === 'student' ? 'Students' : 'Recruiters']
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Get competitions for student (only approved and upcoming)
export const getCompetitions = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const data = await competitionService.fetchApprovedCompetitions(student_id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

// Submit a new competition (student)
export const submitCompetition = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const competitionData = {
      ...req.body,
      createdBy: student_id,
      status: 'pending'
    };
    const data = await competitionService.createCompetitionRecord(competitionData);
    res.status(201).json({ success: true, message: "Competition submitted for approval", data });
  } catch (err) {
    next(err);
  }
};

// Register for competition
export const registerForCompetition = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { competition_id } = req.body;
    
    await pool.query(
      "INSERT IGNORE INTO competition_registrations (competition_id, student_id) VALUES (?, ?)",
      [competition_id, student_id]
    );
    
    res.status(201).json({ success: true, message: "Registered for competition successfully" });
  } catch (err) {
    next(err);
  }
};

// Get events for student
export const getEvents = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const [rows] = await pool.query(`
      SELECT e.*, 
             CASE WHEN er.id IS NOT NULL THEN 1 ELSE 0 END as registered
      FROM events e
      LEFT JOIN event_registrations er ON er.event_id = e.id AND er.student_id = ?
      WHERE e.date >= CURDATE() AND (e.status = 'approved' OR e.status IS NULL)
      ORDER BY e.date ASC
    `, [student_id]);
    
    const formatted = rows.map(r => ({ ...r, registered: r.registered === 1 }));
    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
};

// Register for event
export const registerForEvent = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { event_id } = req.body;
    
    await pool.query(
      "INSERT IGNORE INTO event_registrations (event_id, student_id) VALUES (?, ?)",
      [event_id, student_id]
    );
    
    res.status(201).json({ success: true, message: "Registered for event successfully" });
  } catch (err) {
    next(err);
  }
};

// Get assessments for student
export const getAssessments = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const [rows] = await pool.query(`
      SELECT a.*, 
             aa.status as attempt_status,
             aa.score
      FROM assessments a
      LEFT JOIN assessment_attempts aa ON aa.assessment_id = a.id AND aa.student_id = ?
      WHERE a.deadline >= CURDATE()
      ORDER BY a.deadline ASC
    `, [student_id]);
    
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Start or Complete assessment
export const updateAssessmentStatus = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { assessment_id, status, score } = req.body;
    
    if (status === 'Completed') {
      await pool.query(
        "INSERT INTO assessment_attempts (assessment_id, student_id, status, score, completed_at) VALUES (?, ?, 'Completed', ?, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE status = 'Completed', score = ?, completed_at = CURRENT_TIMESTAMP",
        [assessment_id, student_id, score, score]
      );
    } else {
      await pool.query(
        "INSERT IGNORE INTO assessment_attempts (assessment_id, student_id, status) VALUES (?, ?, 'Started')",
        [assessment_id, student_id]
      );
    }
    
    res.json({ success: true, message: "Assessment status updated" });
  } catch (err) {
    next(err);
  }
};

// Get public settings (for student sidebar)
export const getPublicSettings = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT academic_year, semester FROM admin_settings LIMIT 1"
    );
    const settings = rows.length > 0 ? rows[0] : {};
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};
// Get Application Rounds for Student Timeline
export const getMyApplicationRounds = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { id } = req.params; // application_id

    // Verify application belongs to student
    const [[app]] = await pool.query("SELECT id FROM applications WHERE id = ? AND student_id = ?", [id, student_id]);
    if (!app) return res.status(403).json({ success: false, message: "Unauthorized or not found" });

    const [rounds] = await pool.query("SELECT * FROM application_rounds WHERE application_id = ? ORDER BY date ASC, time ASC", [id]);
    res.json({ success: true, data: rounds });
  } catch (err) {
    next(err);
  }
};

// Submit an event (student)
export const submitEvent = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { title, description, date, type } = req.body;
    await pool.query(
      "INSERT INTO events (title, description, date, type, status, submitted_by) VALUES (?, ?, ?, ?, 'pending', ?)",
      [title, description, date, type || 'Workshop', student_id]
    );
    res.status(201).json({ success: true, message: "Event submitted for approval" });
  } catch (err) {
    next(err);
  }
};

// Submit a resource (student)
export const submitResource = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    const { title, link, branch, category } = req.body;
    await pool.query(
      "INSERT INTO student_resources (title, link, branch, category, status, submitted_by) VALUES (?, ?, ?, ?, 'pending', ?)",
      [title, link, branch, category, student_id]
    );
    res.status(201).json({ success: true, message: "Resource submitted for approval" });
  } catch (err) {
    next(err);
  }
};

// Get approved resources
export const getResources = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, link, branch, category, status, created_at FROM student_resources WHERE status = 'approved' ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

// Get the student's own submissions
export const getMySubmissions = async (req, res, next) => {
  try {
    const student_id = req.user.id;
    
    // Ensure aliases match for uniform sorting/mapping in frontend
    const [events] = await pool.query("SELECT id, title, status, 'event' as category_type, created_at FROM events WHERE submitted_by = ?", [student_id]);
    const [competitions] = await pool.query("SELECT id, title, status, 'competition' as category_type, created_at FROM competitions WHERE createdBy = ?", [student_id]);
    const [resources] = await pool.query("SELECT id, title, status, 'resource' as category_type, created_at FROM student_resources WHERE submitted_by = ?", [student_id]);
    
    const allSubmissions = [...events, ...competitions, ...resources].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({ success: true, data: allSubmissions });
  } catch (err) {
    next(err);
  }
};
