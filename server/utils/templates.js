export const generateEmailTemplate = (type, data) => {
  const isInterview = type === 'interview';
  const headerColor = isInterview ? '#2563eb' : '#7c3aed';
  const subtitle = isInterview ? 'Interview Invitation' : 'Orientation Program';
  const title = `Welcome to your next step with ${data.company || 'EDUVATE'}`;
  const roundDetails = data.interviewType || data.programTitle || 'Not specified';
  const primaryRole = data.role || 'Program Participant';
  const instructions = data.instructions || data.description || '';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid ${headerColor};">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">EDUVATE</h1>
            <p style="margin: 5px 0 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px;">${subtitle}</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px; font-size: 18px; color: #1f2937; font-weight: 600;">Hello ${data.name},</p>
            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4b5563;">
              ${title}. We are excited to inform you about the scheduled details for your <strong>${primaryRole}</strong> application.
            </p>

            <!-- Details Card -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 15px;">
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; width: 140px; font-weight: 500;">Application ID</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600; font-family: monospace; font-size: 16px;">${data.applicationId}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Company</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600;">${data.company || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Round / Event</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600;">${roundDetails}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Date</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600;">${data.date}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Time</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600;">${data.time}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 0; color: #6b7280; font-weight: 500; vertical-align: top;">Location / Link</td>
                  <td style="padding-bottom: 0; color: ${headerColor}; font-weight: 600;">
                    <a href="${data.location && data.location.includes('http') ? data.location : '#'}" style="color: ${headerColor}; text-decoration: none;">${data.location}</a>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Instructions -->
            ${instructions ? `
            <div style="margin-bottom: 35px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">Important Instructions</h3>
              <div style="font-size: 15px; line-height: 1.6; color: #4b5563; padding: 16px; background-color: #f3f4f6; border-radius: 6px; border-left: 4px solid #9ca3af;">
                ${instructions}
              </div>
            </div>
            ` : ''}

            <!-- CTA -->
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://eduvate.com/dashboard" style="display: inline-block; padding: 14px 32px; background-color: ${headerColor}; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; text-transform: uppercase;">
                View Applicant Dashboard
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 13px; color: #6b7280;">Need help? Contact <a href="mailto:support@eduvate.com" style="color: ${headerColor}; text-decoration: none; font-weight: 500;">support@eduvate.com</a></p>
            <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">This is an automated message. Please do not reply.</p>
            <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} EDUVATE. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateApplicationConfirmationTemplate = (data) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Header -->
          <div style="background-color: #ffffff; padding: 30px; text-align: center; border-bottom: 3px solid #10b981;">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #111827; letter-spacing: -0.5px;">EDUVATE</h1>
            <p style="margin: 5px 0 0; font-size: 13px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 1.5px;">Empowering Your Career Journey</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px 30px;">
            <p style="margin: 0 0 20px; font-size: 18px; color: #1f2937; font-weight: 600;">Hi ${data.name},</p>
            <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #4b5563;">
              Thank you for applying through EDUVATE! Your application has been successfully submitted. 🎉
            </p>

            <!-- Application Details Card -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 25px; margin-bottom: 20px; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 15px; font-size: 14px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">📌 Application Details</h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 15px;">
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; width: 140px; font-weight: 500;">Application ID</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600; font-family: monospace; font-size: 16px;">${data.applicationId}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Job Role</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600;">${data.jobTitle}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Company</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600;">${data.companyName}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px; color: #6b7280; font-weight: 500;">Applied On</td>
                  <td style="padding-bottom: 12px; color: #111827; font-weight: 600;">${data.appliedOn}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 0; color: #6b7280; font-weight: 500;">Status</td>
                  <td style="padding-bottom: 0px; color: #10b981; font-weight: 600;">Applied</td>
                </tr>
              </table>
            </div>

            <!-- Job Details Card -->
            <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px 25px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
              <h3 style="margin: 0 0 15px; font-size: 14px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">💼 Job Details</h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 15px;">
                <tr>
                  <td style="padding-bottom: 8px; color: #6b7280; width: 140px; font-weight: 500;">Location</td>
                  <td style="padding-bottom: 8px; color: #111827; font-weight: 600;">${data.location || 'Remote/TBD'}</td>
                </tr>
                <tr>
                  <td style="padding-bottom: 0px; color: #6b7280; font-weight: 500;">Salary (CTC)</td>
                  <td style="padding-bottom: 0px; color: #111827; font-weight: 600;">${data.salary ? data.salary : 'To be discussed'}</td>
                </tr>
              </table>
            </div>

            <!-- Next Steps -->
            <div style="margin-bottom: 35px;">
              <h3 style="margin: 0 0 12px; font-size: 14px; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">📌 Next Steps</h3>
              <ul style="margin: 0; padding: 0 0 0 20px; font-size: 15px; line-height: 1.8; color: #4b5563;">
                <li style="margin-bottom: 8px;">The company will review your application</li>
                <li style="margin-bottom: 8px;">Shortlisted candidates will be notified</li>
                <li>Track updates in your dashboard</li>
              </ul>
            </div>

            <!-- CTA -->
            <div style="text-align: center; margin-top: 40px;">
              <a href="https://eduvate.com/dashboard" style="display: inline-block; padding: 14px 32px; background-color: #10b981; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                View Application
              </a>
            </div>

          </div>

          <!-- Footer -->
          <div style="background-color: #f9fafb; padding: 24px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 13px; color: #6b7280;">Need help? Contact <a href="mailto:support@eduvate.com" style="color: #10b981; text-decoration: none; font-weight: 500;">support@eduvate.com</a></p>
            <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">This is an automated message. Please do not reply.</p>
            <p style="margin: 8px 0 0; font-size: 12px; color: #9ca3af;">&copy; ${new Date().getFullYear()} EDUVATE. All rights reserved.</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateWhatsAppMessage = (type, data) => {
  if (type === 'application_confirmation') {
    return `Hello *${data.name}*,

Your application has been successfully submitted ✅

📌 *Application ID:* ${data.applicationId}
💼 *Role:* ${data.jobTitle}
🏢 *Company:* ${data.companyName}

We will notify you once your application is reviewed.

Best of luck! 🍀
EDUVATE Team`;
  }

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
