<div align="center">
  <h1>🚀 EDUVATE (SQUAD-404) Central Portal</h1>
  <p><b>A modern, production-ready Student Placement & Innovation Hub designed for scale, security, and seamless user experiences.</b></p>
</div>

<br>

## 📖 Project Overview
EDUVATE is a full-stack Placement Management System strictly engineered to connect Students, Corporate Recruiters, and University Administrators under a singular, dynamic nexus. Stripped of legacy bloat, the application features an incredibly robust defensive security architecture while maintaining a pristine, visually stunning user experience powered by React and Tailwind CSS.

## 🛠 Tech Stack
- **Frontend Framework**: React.js, Tailwind CSS
- **Backend Architecture**: Node.js, Express.js
- **Database Layer**: MySQL (Structured Relational Data), Redis (In-Memory Token Blacklisting)
- **Security & Auth**: Dual-Token JWT System, Double-Submit CSRF Interceptors, Argon2/Bcrypt Password Hashing, Google OAuth 2.0 Integration
- **Infrastructure**: Express Rate Limiting, Joi Input Validation, Nodemailer Asynchronous Transporters

## ✨ Core Features
### 🔐 Hardened Security Pipeline
* **Dual-Token Engine**: Utilizes 15-minute completely in-memory Access Tokens alongside 7-day HttpOnly Refresh Cookies.
* **CSRF Immunity**: Automatically enforces cryptographically secure pseudo-random hashes via the Double-Submit Cookie pattern.
* **Decentralized Validation**: Complete Express routing layer lockdown using strictly typed `Joi` validation schemas.

### 👥 Tri-State Role Architecture
* **Student Dashboard**: Curate dynamic portfolios, apply for jobs/hackathons, track application progress seamlessly, and submit support tickets.
* **Recruiter Suite**: Independently manage corporate branding, schedule interviews, post targeted job openings, and accept/reject applicants directly.
* **Admin Overwatch**: Execute total domain control including managing global settings, approving newly registered accounts securely, and generating system-wide real-time announcements.

### 📧 Scalable Notification Engine
* Fully decoupled `Nodemailer` integration handling strict single-use Tokenized Password Resets and workflow automation sequences safely.

## ⚙️ Local Setup Instructions
Follow these steps to spin up the EDUVATE environment locally.

### 1. Database Initialization
1. Ensure **MySQL** and **Redis** are installed and running locally.
2. Create a new MySQL instance/database (e.g., `squad404`).
3. Execute the SQL migrations located securely in `/server/migrations/` to construct the schemas natively.

### 2. Backend Initialization
\`\`\`bash
cd server
npm install
npm run dev
\`\`\`
*Before starting, duplicate `server/.env.example` to `server/.env` and securely populate your authentication keys (MySQL strings, JWT Secret, Google Auth ID, Redis).*

### 3. Frontend Initialization
\`\`\`bash
cd client
npm install
npm start
\`\`\`
*The React application natively proxies API queries to the explicit `http://localhost:5000` gateway.*

## 📐 Architecture Explanation
The repository is segmented into a deeply decoupled **Client-Server Hierarchy**:
- `/client`: Houses the isolated React ecosystem, featuring unified contextual global stores (`AuthContext`, `NotificationContext`) resolving directly to the customized `services/api.js` HTTP Interceptor wrapper.
- `/server`: Features a strictly tiered architectural pattern (`Routes -> Middleware (Validation/Auth) -> Controllers (Business Logic) -> Services (Data Access)`). Heavily enforces dependency injection mapping methodologies.

## 🛡️ License
Proprietary deployment. All structural rights secured internally securely by the SQUAD-404 Development Nexus.
