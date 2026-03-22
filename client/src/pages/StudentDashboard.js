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

const resourcesData = {
  Aptitude: [
    {
      title: "Quantitative Aptitude by R.S. Aggarwal",
      link: "https://share.google/uMscUp3R10bPIqTgt"
    },
    {
      title: "Aptitude Practice Questions",
      link: "https://share.google/kxUxXTLi4f6mhRRER"
    },
    {
      title: "IndiaBix Aptitude Questions",
      link: "https://www.indiabix.com/"
    },
    {
      title: "LearnTheta Aptitude Questions",
      link: "https://www.learntheta.com/aptitude-questions/"
    },
    {
      title: "Campus Recruitment Aptitude Book (PDF)",
      link: "https://www.campusrecruitment.co.in/CampusRecruitmentBook.pdf"
    },
    {
      title: "Practice Aptitude Tests",
      link: "https://www.practiceaptitudetests.com/"
    }
  ],
  DSA: [
    {
      title: "DSA Interview Questions",
      link: "https://share.google/3lAY0EOeDNyfvq7Zt"
    },
    {
      title: "Striver DSA Sheet",
      link: "https://share.google/oTpq8QODwa7wFgR2E"
    }
  ],
  Coding: [
    {
      title: "Python Crash Course by Eric Matthes",
      link: "https://share.google/PAwpx8UvD2ppUTRWK"
    },
    {
      title: "Full Stack",
      link: "https://share.google/sAynTel4CZ7mjq0LX"
    }
  ],
  "Core Subjects": [
    { title: "Operating Systems Notes", link: "#" }
  ],
  Digital: [
    {
      title: "Digital Electronics MCQ",
      link: "https://share.google/HJ7jsa3u6oT79wKSu"
    },
    {
      title: "Questions on VLSI",
      link: "https://share.google/Gjat9LRly9AVDlaff"
    }
  ],
  Analog: [
    {
      title: "MCQ Questions",
      link: "https://share.google/qj4GcJCaceRjJrQHE"
    }
  ],
  Chemical: [
    { title: "Chemical Engineering Interview Questions", link: "#" }
  ]
};

const branchCategories = {
  CSE: ["Aptitude", "DSA", "Coding", "Core Subjects"],
  ECE: ["Aptitude", "Digital", "Analog"],
  EEE: ["Aptitude", "Core Subjects"],
  Mechanical: ["Aptitude", "Core Subjects"],
  Chemical: ["Aptitude", "Core Subjects"]
};

function ResourcesSection() {
  const [selectedBranch, setSelectedBranch] = useState("CSE");
  const [selectedCategory, setSelectedCategory] = useState("Aptitude");

  return (
    <div className="bj-root" style={{ animation: "fadeSlideIn 0.28s ease both" }}>
      <div className="bj-top">
        <div>
          <h2 className="bj-title">Resources</h2>
          <p className="bj-sub">Explore study materials and interview prep</p>
        </div>
      </div>
      
      {/* Branches */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a2540', marginBottom: '12px' }}>Branches</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.keys(branchCategories).map(branch => (
          <button
            key={branch}
            onClick={() => {
              setSelectedBranch(branch);
              setSelectedCategory(branchCategories[branch][0]);
            }}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedBranch === branch ? '1px solid #800000' : '1px solid #e4e9f0',
              background: selectedBranch === branch ? 'linear-gradient(90deg, rgba(128,0,0,0.1) 0%, rgba(128,0,0,0.05) 100%)' : '#fff',
              color: selectedBranch === branch ? '#800000' : '#4b5563',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedBranch === branch ? '0 2px 8px rgba(128,0,0,0.1)' : 'none'
            }}
          >
            {branch}
          </button>
        ))}
      </div>

      {/* Categories */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a2540', marginBottom: '12px' }}>Categories</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {branchCategories[selectedBranch].map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: selectedCategory === cat ? '1px solid #800000' : '1px solid #e4e9f0',
              background: selectedCategory === cat ? 'linear-gradient(90deg, rgba(128,0,0,0.1) 0%, rgba(128,0,0,0.05) 100%)' : '#fff',
              color: selectedCategory === cat ? '#800000' : '#4b5563',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: selectedCategory === cat ? '0 2px 8px rgba(128,0,0,0.1)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Resources */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a2540', marginBottom: '12px' }}>Resources</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {resourcesData[selectedCategory]?.map((item, idx) => (
          <div key={idx} style={{ 
            background: '#fff', 
            borderRadius: '12px', 
            padding: '20px', 
            border: '1px solid #e8ecf0',
            boxShadow: '0 2px 8px rgba(10,37,64,0.04)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(10,37,64,0.09)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(10,37,64,0.04)'; }}
          >
            <div>
              <h4 
                className="resource-title"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(item.link, "_blank", "noopener,noreferrer");
                }}
                style={{ fontSize: '15px', fontWeight: 700, color: '#0a2540', marginBottom: '8px', lineHeight: 1.4, cursor: 'pointer' }}
              >
                {item.title}
              </h4>
              {item.description && <p style={{ fontSize: '13px', color: '#8492a6', marginBottom: '12px' }}>{item.description}</p>}
            </div>
            <div style={{ marginTop: '16px' }}>
              <button
                onClick={(e) => {
                  e.stopPropagation();   // prevents parent click
                  window.open(item.link, "_blank", "noopener,noreferrer");
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(90deg, rgba(128,0,0,0.1) 0%, rgba(128,0,0,0.05) 100%)',
                  color: '#800000',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: '1px solid #800000',
                  fontSize: '13px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#800000'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(90deg, rgba(128,0,0,0.1) 0%, rgba(128,0,0,0.05) 100%)'; e.currentTarget.style.color = '#800000'; }}
              >
                Open Resource
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
      case 'resources': return <ResourcesSection />;
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