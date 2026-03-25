import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { generateEmailTemplate, generateApplicationConfirmationTemplate } from './templates.js';
import { getJobOutreachTemplate } from './emailTemplates.js';

dotenv.config();

// Initialize Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

// Verify connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("[Mailer] Transporter Error Details:", error);
  } else {
    console.log("[Mailer] SMTP Server is ready to take messages");
  }
});

/**
 * Universal email dispatcher
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log(`[Mailer] Attempting to send email to ${to}...`);
    const info = await transporter.sendMail({
      from: `"PLACEMENT CELL - EDUVATE" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`[Mailer] Email sent successfully to ${to} (MessageID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`[Mailer] CRITICAL ERROR for ${to}:`, error);
    throw new Error(`Email dispatch failed: ${error.message}`);
  }
};

/**
 * Sends a visually styled Password Reset email
 */
export const sendPasswordResetEmail = async (email, rawToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #ef4444;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">EDUVATE</h1>
            <p style="margin: 5px 0 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px;">Security Notice</p>
          </div>

          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px; font-size: 18px; color: #1f2937; font-weight: 600;">Hello,</p>
            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4b5563;">
              You recently requested to reset your password for your EDUVATE account. Click the secure button below to set a new password. This link is extremely time-sensitive and will expire in <strong>15 minutes</strong>.
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #ef4444; color: #ffffff; font-weight: 600; text-decoration: none; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                Securely Reset Password
              </a>
            </div>
            
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              If you did not make this request or you do not have an EDUVATE account, please completely ignore this email.
            </p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject: "Secure Password Reset - EDUVATE", html });
};

/**
 * Pre-defined Application/Notification email templates
 */
export const sendNotificationEmail = async (email, subject, message) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #3b82f6;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">EDUVATE</h1>
            <p style="margin: 5px 0 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px;">Notification</p>
          </div>

          <div style="padding: 40px 30px;">
            <div style="padding: 20px; border-left: 4px solid #3b82f6; background-color: #f0fdf4;">
              <p style="color: #1f2937; margin: 0; line-height: 1.6; font-size: 16px;">${message}</p>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 13px; color: #6b7280;">Need help? Contact <a href="mailto:support@eduvate.com" style="color: #3b82f6; text-decoration: none; font-weight: 500;">support@eduvate.com</a></p>
            <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">This is an automated message. Please do not reply.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  return sendEmail({ to: email, subject, html });
};

/**
 * Sends a styled OTP verification email for company registration
 */
export const sendOTPEmail = async (email, otp) => {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #8b5cf6;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">EDUVATE</h1>
            <p style="margin: 5px 0 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px;">Email Verification</p>
          </div>

          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px; font-size: 18px; color: #1f2937; font-weight: 600;">Hello,</p>
            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4b5563;">
              Thank you for registering on EDUVATE. Use the secure verification code below to complete your company sign-up. This code will expire in <strong>10 minutes</strong>.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <div style="display: inline-block; padding: 20px 48px; background-color: #f3f4f6; color: #111827; font-weight: 800; font-size: 36px; letter-spacing: 14px; border-radius: 8px; border: 2px dashed #8b5cf6;">
                ${otp}
              </div>
            </div>
            
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 20px;">
              If you did not request this code, please securely ignore this email. Do not share this code with anyone.
            </p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject: "EDUVATE - Email Verification Code", html });
};

/**
 * Sends a structured Interview Invitation email
 */
export const sendInterviewEmail = async (email, details) => {
  const html = generateEmailTemplate('interview', details);
  return sendEmail({ to: email, subject: "Interview Invitation - EDUVATE", html });
};

/**
 * Sends a structured Orientation Program email
 */
export const sendOrientationEmail = async (email, details) => {
  const html = generateEmailTemplate('orientation', details);
  return sendEmail({ to: email, subject: "Orientation Program Details - EDUVATE", html });
};

/**
 * Sends a professional confirmation email when a student applies for a job
 */
export const sendApplicationConfirmationEmail = async (student, job, application) => {
  const html = generateApplicationConfirmationTemplate({
    name: student.name,
    applicationId: application.application_code,
    jobTitle: job.title,
    companyName: job.company_name,
    appliedOn: new Date(application.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    location: job.location,
    salary: job.ctc
  });

  return sendEmail({ 
    to: student.email, 
    subject: `Application Submitted Successfully – ${job.title}`, 
    html 
  });
};

/**
 * Sends a professional outreach email to a hiring manager/HR.
 */
export const sendJobOutreachEmail = async (toEmail, jobData) => {
    try {
        const html = getJobOutreachTemplate(jobData);
        return await sendEmail({ 
            to: toEmail, 
            subject: `Talent Pipeline: ${jobData.job_title} Role at ${jobData.company_name}`, 
            html 
        });
    } catch (error) {
        console.error(`[Mailer] Delivery failed to ${toEmail}:`, error.message);
        throw error;
    }
};

/**
 * Sends automated credentials to a newly onboarded company
 */
export const sendCompanyCredentialsEmail = async (email, companyName, password) => {
  const loginUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #10b981;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">EDUVATE</h1>
            <p style="margin: 5px 0 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px;">Account Activated</p>
          </div>

          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px; font-size: 18px; color: #1f2937; font-weight: 600;">Welcome to EDUVATE, ${companyName}!</p>
            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4b5563;">
              An administrator has approved your partnership request and created a verified company account for you. You can now access our talent portal using the temporary credentials below.
            </p>
            
            <div style="background-color: #f9fafb; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 30px;">
                <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0; font-size: 14px; color: #6b7280;"><strong>Temporary Password:</strong> <code style="background: #eee; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #111827;">${password}</code></p>
            </div>

            <div style="text-align: center; margin: 35px 0;">
              <a href="${loginUrl}" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; font-weight: 600; text-decoration: none; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                Login to Portal
              </a>
            </div>
            
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #ef4444; font-weight: 600;">
              Important: Please change your password immediately after your first login for security.
            </p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject: "Your Company Portal is Ready - EDUVATE", html });
};
