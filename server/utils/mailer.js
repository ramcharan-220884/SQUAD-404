import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use SMTP configs if not using Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS 
  }
});

/**
 * Universal email dispatcher
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"SQUAD-404 Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent successfully to ${to} (MessageID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error.message);
    throw new Error('Email dispatch failed');
  }
};

/**
 * Sends a visually styled Password Reset email
 */
export const sendPasswordResetEmail = async (email, rawToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${rawToken}`;
  
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; max-width: 600px; margin: 0 auto; background-color: #f9f9fa; border-radius: 12px; border: 1px solid #eaebed;">
        <div style="text-align: center; margin-bottom: 25px;">
           <h2 style="color: #052c42; font-weight: 900; margin: 0; letter-spacing: -0.5px;">EDUVATE <span style="color: #346b41;">PORTAL</span></h2>
           <p style="color: #888; font-size: 11px; margin-top: 5px; text-transform: uppercase; letter-spacing: 2px;">Security Notice</p>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.02);">
            <p style="color: #333; font-size: 15px; line-height: 1.6; margin-top: 0;">Hello,</p>
            <p style="color: #555; font-size: 15px; line-height: 1.6;">You recently requested to reset your password for your EDUVATE account. Click the button below to securely set a new password. This link is extremely time-sensitive and will aggressively expire in <strong>15 minutes</strong>.</p>
            
            <div style="text-align: center; margin: 35px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-weight: bold; text-decoration: none; border-radius: 8px; box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3);">Securely Reset Password</a>
            </div>
            
            <p style="color: #888; font-size: 13px; line-height: 1.5; border-top: 1px solid #eee; padding-top: 20px;">If you did not make this request or you do not have an EDUVATE account, please completely ignore this email.</p>
        </div>
    </div>
  `;

  return sendEmail({ to: email, subject: "Secure Password Reset - EDUVATE", html });
};

/**
 * Pre-defined Application/Notification email templates
 */
export const sendNotificationEmail = async (email, subject, message) => {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 24px; max-width: 600px;">
        <h2 style="color: #052c42;">EDUVATE Notification</h2>
        <div style="padding: 20px; border-left: 4px solid #16a34a; background-color: #f8fafc;">
            <p style="color: #334155; margin: 0; line-height: 1.6;">${message}</p>
        </div>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
};
