export const generateEmailTemplate = (type, data) => {
  const isInterview = type === 'interview';
  const headerColor = isInterview ? '#0ea5e9' : '#8b5cf6';
  const subtitle = isInterview ? 'Interview Invitation' : 'Orientation Program';
  const title = `Welcome to your next step with ${data.company || 'EDUVATE'}`;
  const roundDetails = data.interviewType || data.programTitle || 'Not specified';
  const primaryRole = data.role || 'Program Participant';
  const instructions = data.instructions || data.description || 'No special instructions.';

  return `
    <div style="margin: 0; padding: 40px 20px; background-color: #f8fafc; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);">
        
        <!-- Header -->
        <tr>
          <td style="background-color: #0f172a; padding: 40px 30px; text-align: center; border-bottom: 4px solid ${headerColor};">
            <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">EDUVATE <span style="color: ${headerColor};">PORTAL</span></h1>
            <p style="margin: 8px 0 0; font-size: 14px; font-weight: 500; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">${subtitle}</p>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding: 40px 30px;">
            <p style="margin: 0 0 20px; font-size: 18px; color: #1e293b; font-weight: 600;">Hello ${data.name},</p>
            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #475569;">
              ${title}. We are excited to inform you about the scheduled details for your <strong>${primaryRole}</strong> application.
            </p>

            <!-- Details Card -->
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid ${headerColor};">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 15px;">
                <tr>
                  <td style="padding-bottom: 12px; color: #64748b; width: 140px; font-weight: 600;">Application ID</td>
                  <td style="padding-bottom: 12px; color: #0f172a; font-weight: 700; font-family: monospace;">${data.applicationId}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #64748b; font-weight: 600;">Company</td>
                  <td style="padding-bottom: 12px; color: #0f172a; font-weight: 600;">${data.company || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #64748b; font-weight: 600;">Round / Event</td>
                  <td style="padding-bottom: 12px; color: #0f172a; font-weight: 600;">${roundDetails}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #64748b; font-weight: 600;">Date</td>
                  <td style="padding-bottom: 12px; color: #0f172a; font-weight: 600;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #64748b; font-weight: 600;">Time</td>
                  <td style="padding-bottom: 12px; color: #0f172a; font-weight: 600;">${data.time}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 0; color: #64748b; font-weight: 600; vertical-align: top;">Location / Link</td>
                  <td style="padding-bottom: 0; color: ${headerColor}; font-weight: 600;">${data.location}</td>
                </tr>
              </table>
            </div>

            <!-- Instructions -->
            <div style="margin-bottom: 35px;">
              <h3 style="margin: 0 0 10px; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Instructions</h3>
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #334155; padding: 15px; background-color: #fffbeb; border-radius: 8px; border: 1px solid #fef3c7;">
                ${instructions}
              </p>
            </div>

            <!-- CTA -->
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td align="center">
                  <a href="https://eduvate.com/dashboard" style="display: inline-block; padding: 16px 36px; background-color: ${headerColor}; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
                    View Applicant Dashboard
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color: #f8fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; font-size: 13px; color: #64748b; font-weight: 500;">This is an automated message from the EDUVATE Placement Management System.</p>
            <p style="margin: 8px 0 0; font-size: 13px; color: #94a3b8;">For questions or support, contact <a href="mailto:support@eduvate.com" style="color: ${headerColor}; text-decoration: none;">support@eduvate.com</a></p>
          </td>
        </tr>
        
      </table>
    </div>
  `;
};

export const generateWhatsAppMessage = (type, data) => {
  const roundDetails = data.interviewType || data.programTitle || 'Not specified';
  const role = data.role || 'Not specified';
  const company = data.company || 'Not specified';
  const instructions = data.instructions || data.description || 'No special instructions.';

  return `📢 *EDUVATE Portal*

Hello *${data.name}*,
You have been successfully scheduled for ${type === 'interview' ? 'an Interview' : 'an Orientation'}! 🎉

*Application Details:*
🆔 Application ID: ${data.applicationId}
💼 Role: ${role}
🏢 Company: ${company}
🔄 Round: ${roundDetails}

*Schedule:*
📅 Date: ${data.date}
⏰ Time: ${data.time}
📍 Location: ${data.location}

*Instructions:*
📌 ${instructions}

Please check your email for full details. Best of luck! 🚀`;
};
