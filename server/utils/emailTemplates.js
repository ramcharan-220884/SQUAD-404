export const getJobOutreachTemplate = (jobData) => {
    return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #eaeaec; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 15px; margin-top: 0;">
            Partnership Inquiry: ${jobData.job_title} at ${jobData.company_name}
        </h2>
        
        <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
            Hello Talent Acquisition Team,
        </p>
        
        <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
            We recently came across your active opening for the <strong>${jobData.job_title}</strong> position at <strong>${jobData.company_name}</strong>. 
            Our university pipeline currently has a pool of highly vetted, pre-assessed candidates whose technical stacks align perfectly with this role.
        </p>

        <p style="color: #4a4a4a; line-height: 1.6; font-size: 16px;">
            We would love to provide you with direct access to these candidate profiles to help streamline your hiring process and fulfill your requirements faster.
        </p>

        <div style="text-align: center; margin: 35px 0;">
            <a href="mailto:${process.env.EMAIL_USER}?subject=Re: ${jobData.job_title} Candidates" 
               style="background-color: #3498db; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
               Review Candidate Profiles
            </a>
        </div>

        <p style="color: #7f8c8d; font-size: 14px; margin-top: 35px; border-top: 1px solid #ecf0f1; padding-top: 20px;">
            Best Regards,<br>
            <strong>University Placement Cell</strong><br>
            SQUAD-404 Administration
        </p>
    </div>
    `;
};
