import React, { useEffect, useState } from "react";
import socketService from "../services/socketService";
import { useNotification } from "../context/NotificationContext";
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import RightPanel from '../components/dashboard/RightPanel';
import HomeContent from '../components/dashboard/HomeContent';
import HelpSupport from '../components/dashboard/HelpSupport';
import Interviews from '../components/dashboard/Interviews';
import Assessments from '../components/dashboard/Assessments';
import Events from '../components/dashboard/Events';
import AppliedJobs from '../components/dashboard/AppliedJobs';
import Competitions from '../components/dashboard/Competitions';
import { 
  getProfile, 
  updateProfile, 
  getAvailableJobs, 
  applyForJob, 
  getMyApplications 
} from "../services/studentService";
import BrowseJobs from "../components/dashboard/BrowseJobs";
import StudentProfile from "./StudentProfile";
import Announcements from "../components/dashboard/Announcements";
import '../styles/dashboard.css';

// Map DB application status to progress steps
function mapApplicationToDisplayFormat(app) {
  const allSteps = ["Applied", "Shortlisted", "Selected"];
  const statusMap = {
    "Applied": 0,
    "Shortlisted": 1,
    "Selected": 2,
    "Rejected": 2
  };

  const isRejected = app.status === "Rejected";
  const currentStep = statusMap[app.status] !== undefined ? statusMap[app.status] : 0;

  const steps = isRejected
    ? ["Applied", "Shortlisted", "Rejected"]
    : allSteps;

  return {
    id: app.id || app.application_id,
    title: app.title || "Job Position",
    company: app.company_name || "Company",
    appliedDate: app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A",
    status: app.status || "Applied",
    progress: Math.round(((currentStep + 1) / steps.length) * 100),
    steps,
    currentStep,
    isRejected,
    ctc: app.ctc,
    // New fields for details view
    description: app.description,
    location: app.location,
    job_type: app.type,
    skills: app.skills,
    experience: app.experience,
    eligible_branches: app.eligible_branches,
    deadline: app.deadline,
    min_cgpa: app.min_cgpa,
    allowed_backlogs: app.allowed_backlogs
  };
}

export default function StudentDashboard() {
  const { showNotification } = useNotification();
  const [activePage, setActivePage] = useState('home');
  const [appliedJobs, setAppliedJobs] = useState([]);

  const fetchAppliedJobs = React.useCallback(async () => {
    try {
      const data = await getMyApplications();
      // data is now the array of applications directly
      const mapped = Array.isArray(data) ? data.map(mapApplicationToDisplayFormat) : [];
      setAppliedJobs(mapped);
    } catch (err) {
      console.error("Error fetching applied jobs:", err);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socketService.connect(token);
      
      socketService.on("applicationStatusUpdated", (data) => {
        showNotification(`Application Status Updated: Your application for ${data.jobTitle} is now ${data.status}`, "info", "student");
        fetchAppliedJobs(); // Refresh state
      });

      socketService.on("ticketReply", (data) => {
        showNotification(`Support Ticket Update: ${data.message}`, "info", "student");
      });

      socketService.on("newAnnouncement", (data) => {
        showNotification(`New Announcement: ${data.title}`, "info", "student");
      });

      socketService.on("newJobPosted", (data) => {
        showNotification(`New Job Opportunity: ${data.title} at ${data.company_name || 'a recruiter'}`, "success", "student");
      });
    }

    fetchAppliedJobs();

    return () => {
      // We might not want to disconnect globally if switching between pages, 
      // but the service handles duplicate connections.
      socketService.off("applicationStatusUpdated");
      socketService.off("ticketReply");
      socketService.off("newAnnouncement");
      socketService.off("newJobPosted");
    };
  }, [fetchAppliedJobs, showNotification]);

  const renderCenter = () => {
    switch (activePage) {
      case 'home': return <HomeContent />;
      case 'jobs': return <BrowseJobs onJobApplied={fetchAppliedJobs} />;
      case 'applied-jobs': return <AppliedJobs jobs={appliedJobs} onRefresh={fetchAppliedJobs} />;
      case 'profile': return <StudentProfile isPortal={true} />;
      case 'interviews': return <Interviews />;
      case 'assessments': return <Assessments />;
      case 'events': return <Events />;
      case 'competitions': return <Competitions />;
      case 'announcements': return <Announcements role="student" />;
      case 'help': return <HelpSupport />;
      default: return <HomeContent />;
    }
  };

  return (
    <div className="db-root">
      {/* Sidebar */}
      <Sidebar activeItem={activePage} onItemClick={setActivePage} />

      {/* Main wrapper (header + body) */}
      <div className="db-main-wrapper">
        <Header />

        <div className="db-body">
          {/* Center content */}
          <main className="db-center">
            {renderCenter()}
          </main>

          {/* Right panel */}
          <RightPanel />
        </div>
      </div>
    </div>
  );
}