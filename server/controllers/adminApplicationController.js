import { pool } from "../config/db.js";
import { sendInterviewEmail, sendOrientationEmail } from "../utils/mailer.js";
import { generateWhatsAppMessage } from "../utils/templates.js";
import { io } from "../server.js";

// Get all applications with filters
export const getAdminApplications = async (req, res, next) => {
  try {
    const { job_id, status } = req.query;
    
    let query = `
      SELECT 
        a.id AS application_id,
        a.status AS application_status,
        a.applied_at,
        s.id AS student_id,
        s.name AS student_name,
        s.email,
        s.phone,
        s.country_code,
        j.title AS job_title,
        c.name AS company_name
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (job_id && job_id !== 'all') {
      query += ` AND a.job_id = ?`;
      params.push(job_id);
    }
    
    if (status && status !== 'all') {
      // The frontend uses "Shortlisted", "Interview", "Selected" etc.
      // But the DB enum is ('Applied', 'Shortlisted', 'Rejected', 'Selected')
      // Map it dynamically if needed, or pass exact strings
      query += ` AND a.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY a.applied_at DESC`;

    const [applications] = await pool.query(query, params);
    
    res.json({ success: true, count: applications.length, data: applications });
  } catch (err) {
    next(err);
  }
};

// Notify Candidates
export const notifyCandidates = async (req, res, next) => {
  try {
    const { candidateIds, type, details } = req.body;
    
    if (!candidateIds || !candidateIds.length) {
      return res.status(400).json({ success: false, message: "No candidates selected." });
    }

    // candidateIds are actually application_ids now (from frontend)
    const placeholders = candidateIds.map(() => '?').join(',');
    const query = `
      SELECT 
        a.id AS application_id, a.applied_at,
        s.id AS student_id, s.name, s.email, s.phone, s.country_code,
        j.title AS role,
        c.name AS company
      FROM applications a
      JOIN students s ON a.student_id = s.id
      JOIN jobs j ON a.job_id = j.id
      JOIN companies c ON j.company_id = c.id
      WHERE a.id IN (${placeholders})
    `;
    const [applications] = await pool.query(query, candidateIds);

    if (applications.length === 0) {
      return res.status(404).json({ success: false, message: "Applications not found." });
    }

    let sent = 0;
    let failed = 0;
    const whatsappMessages = [];

    for (const app of applications) {
      try {
        const year = new Date(app.applied_at).getFullYear() || new Date().getFullYear();
        const formattedId = `APP-${year}-${String(app.application_id).padStart(5, '0')}`;
        
        const templateData = {
          name: app.name,
          email: app.email,
          applicationId: formattedId,
          role: app.role,
          company: app.company,
          ...details
        };

        // Send Email
        if (type === 'interview') {
          await sendInterviewEmail(app.email, templateData);
        } else if (type === 'orientation') {
          await sendOrientationEmail(app.email, templateData);
        }

        // Generate WhatsApp message
        if (app.phone) {
          const waMsg = generateWhatsAppMessage(type, templateData);
          const countryCode = app.country_code ? app.country_code.replace(/[^0-9]/g, '') : '91';
          const cleanPhone = app.phone.replace(/[^0-9]/g, '');
          whatsappMessages.push({
            application_id: app.application_id,
            name: app.name,
            phone: countryCode + cleanPhone,
            message: waMsg
          });
        }

        const message = type === 'interview'
          ? `You are invited for an interview on ${details.date} at ${details.time}. Location: ${details.location}`
          : `You are invited to an orientation program on ${details.date} at ${details.time}. Location: ${details.location}`;

        // Emit Socket.IO Notification
        io.to(`student_${app.student_id}`).emit("notification", {
          title: type === 'interview' ? 'Interview Invitation' : 'Orientation Details',
          message: message,
          type: type,
          timestamp: new Date()
        });

        // Insert into notifications table
        await pool.query(
          "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)",
          [app.student_id, type, message]
        );

        sent++;
      } catch (emailErr) {
        console.error(`Failed to notify student ${app.email}:`, emailErr.message);
        failed++;
      }
    }

    res.json({
      success: true,
      message: "Notifications processed successfully.",
      sent,
      failed,
      whatsappMessages
    });

  } catch (err) {
    next(err);
  }
};
