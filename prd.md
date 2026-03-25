# Product Requirements Document (PRD): SQUAD-404 (EDUVATE)

## 1. Product Overview
EDUVATE (SQUAD-404) is a highly scalable, full-stack Placement Management System designed to seamlessly connect Students, Corporate Recruiters, and University Administrators. The platform modernizes and streamlines the recruitment and placement process by providing dedicated portals for each user type, ensuring a cohesive and secure environment for enterprise-level university placements.

## 2. Target Audience
- **Students**: University students actively seeking jobs, internships, or hackathons. They need a centralized place to build profiles, discover opportunities, and track application statuses.
- **Corporate Recruiters (Companies)**: Organizations partnering with the university to hire talent. They require tools to build their employer brand, post jobs, and efficiently manage applicant pipelines through various interview rounds.
- **University Administrators (Admins)**: Faculty members or placement cell coordinators overseeing the entire ecosystem. They need global control to approve companies, manage platform settings, and communicate system-wide updates.

## 3. Core Features

### 3.1 Authentication & Authorization
- **Role-Based Access Control (RBAC)**: Three specialized, deeply segmented user roles (Student, Company, Admin).
- **Hardened Security Architecture**: 
  - Dual-Token JWT System using short-lived Access Tokens (in-memory) and 7-day HTTP-Only Refresh Cookies.
  - Express Rate Limiting to mitigate denial-of-service and brute-force attacks.
- **Onboarding Flows**: 
  - Google OAuth 2.0 integration for frictionless student and recruiter sign-ups.
  - Multi-step company registration utilizing Nodemailer and OTP verification.
- **Password Management**: Highly secure, tokenized password resets.

### 3.2 Student Portal
- **Dynamic Portfolios**: Students can create detailed professional profiles encompassing academic details, resumes, multi-media uploads, and contact information (including WhatsApp integrations).
- **Opportunity Discovery**: A centralized Job Board specifically tailored for available jobs, internships, and hackathons.
- **Application Tracking**: End-to-end visibility into application lifecycles (e.g., Pending, Shortlisted, Interviewing, Accepted, Rejected).
- **Helpdesk**: Built-in support ticketing system for resolving placement-related queries.

### 3.3 Recruiter (Company) Suite
- **Company Branding**: Manage organizational profiles, logos, and descriptions to attract top student talent.
- **Job & Hackathon Management**: Interface to create, edit, pause, and close job postings dynamically.
- **Applicant Pipeline Management**: 
  - Review student applications and resumes securely.
  - Update applicant statuses and manage progressive interview rounds.
- **Approval Gate**: Mandatory administrative approval workflow before a company can interact with students or post jobs.

### 3.4 Administrator Dashboard
- **Platform Overwatch**: Centralized hub to monitor system metrics (active users, total applications, company onboardings).
- **Entity Management**: Review and selectively approve or reject incoming company/recruiter accounts.
- **Global Communication**: Broadcast real-time announcements and notifications across the entire platform ecosystem.
- **Configuration Engine**: Toggle application features, manage global settings, and enforce system themes seamlessly without downtime.

## 4. Non-Functional Requirements
- **Security Specifications**:
  - Double-Submit Cookie pattern explicitly implemented to neutralize CSRF vulnerabilities.
  - Argon2/Bcrypt cryptographic hashing for data at rest (passwords).
  - Joi payload validation for defending against injection attacks at the Express routing layer.
- **Performance & Scalability**:
  - Redis-backed infrastructure for immediate, cluster-ready in-memory token blacklisting.
  - React and Tailwind CSS frontend serving a responsive, low-latency Single Page Application (SPA).
- **Real-Time Capabilities**: Socket.io integration to handle instant UI updates, live chat/notifications, and state propagation.

## 5. Technology Stack
- **Frontend Ecosystem**: React.js, Tailwind CSS, Recharts (for dashboard analytics), Socket.io-client.
- **Backend Architecture**: Node.js, Express.js, Socket.io, Multer (for secure file uploads).
- **Database schemas**: MySQL (Relational mappings for standardized data) and Redis (Caching).
- **Integrations**: Google Auth Library, Nodemailer.
