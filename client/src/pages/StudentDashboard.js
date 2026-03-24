import React, { useEffect, useState } from "react";
import socketService from "../services/socketService";
import { useNotification } from "../context/NotificationContext";
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import RightPanel from '../components/dashboard/RightPanel';
import HomeContent from '../components/dashboard/HomeContent';
import HelpSupport from '../components/dashboard/HelpSupport';
import Interviews from '../components/dashboard/Interviews';
import Events from '../components/dashboard/Events';
import AppliedJobs from '../components/dashboard/AppliedJobs';
import Competitions from '../components/dashboard/Competitions';
import {
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
    { title: "Quantitative Aptitude by R.S. Aggarwal", link: "https://share.google/uMscUp3R10bPIqTgt" },
    { title: "Aptitude Practice Questions", link: "https://share.google/kxUxXTLi4f6mhRRER" },
    { title: "IndiaBix Aptitude Questions", link: "https://www.indiabix.com/" },
    { title: "LearnTheta Aptitude Questions", link: "https://www.learntheta.com/aptitude-questions/" },
    { title: "Campus Recruitment Aptitude Book (PDF)", link: "https://www.campusrecruitment.co.in/CampusRecruitmentBook.pdf" },
    { title: "Practice Aptitude Tests", link: "https://www.practiceaptitudetests.com/" }
  ],
  DSA: [
    { title: "DSA Interview Questions", link: "https://share.google/3lAY0EOeDNyfvq7Zt" },
    { title: "Striver DSA Sheet", link: "https://share.google/oTpq8QODwa7wFgR2E" }
  ],
  Coding: [
    { title: "Python Crash Course by Eric Matthes", link: "https://share.google/PAwpx8UvD2ppUTRWK" },
    { title: "Full Stack", link: "https://share.google/sAynTel4CZ7mjq0LX" }
  ],
  "Core Subjects": [
    { title: "Operating Systems Notes", link: "#" }
  ],
  Digital: [
    { title: "Digital Electronics MCQ", link: "https://share.google/HJ7jsa3u6oT79wKSu" },
    { title: "Questions on VLSI", link: "https://share.google/Gjat9LRly9AVDlaff" }
  ],
  Analog: [
    { title: "MCQ Questions", link: "https://share.google/qj4GcJCaceRjJrQHE" }
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

// ── localStorage helpers for Resources ───────────────────────────────────────
const LS_RES_PENDING  = "pendingResources";
const LS_RES_APPROVED = "approvedResources";
const getLSResApproved = () => JSON.parse(localStorage.getItem(LS_RES_APPROVED)) || [];
const getLSResPending  = () => JSON.parse(localStorage.getItem(LS_RES_PENDING))  || [];
const setLSResPending  = (arr) => localStorage.setItem(LS_RES_PENDING, JSON.stringify(arr));

const ALL_BRANCHES     = Object.keys(branchCategories);
const getCatsForBranch = (b) => branchCategories[b] || [];

function ResourcesSection() {
  const [selectedBranch, setSelectedBranch] = useState("CSE");
  const [selectedCategory, setSelectedCategory] = useState("Aptitude");
  const [approvedResources, setApprovedResources] = useState(getLSResApproved);
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    title: "", link: "", branch: "CSE", category: "Aptitude"
  });

  // Sync approved list when admin approves in another tab
  useEffect(() => {
    const sync = () => setApprovedResources(getLSResApproved());
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  // Merge static resources + admin-approved community resources
  const staticItems = resourcesData[selectedCategory] || [];
  const approvedItems = approvedResources.filter(
    r => r.branch === selectedBranch && r.category === selectedCategory
  );
  const mergedItems = [
    ...staticItems,
    ...approvedItems.filter(ar => !staticItems.some(s => s.title === ar.title))
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const newRes = {
      id: `res-${Date.now()}`,
      ...formData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };
    const updated = [...getLSResPending(), newRes];
    setLSResPending(updated);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
      setFormData({ title: "", link: "", branch: "CSE", category: "Aptitude" });
    }, 1800);
  };

  const openLink = (link) => window.open(link, "_blank", "noopener,noreferrer");

  const filterBtn = (active) => ({
    padding: '8px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.2s ease',
    border: active ? '1px solid #800000' : '1px solid #e4e9f0',
    background: active ? 'linear-gradient(90deg, rgba(128,0,0,0.1) 0%, rgba(128,0,0,0.05) 100%)' : '#fff',
    color: active ? '#800000' : '#4b5563',
    boxShadow: active ? '0 2px 8px rgba(128,0,0,0.1)' : 'none',
  });

  return (
    <div className="bj-root" style={{ animation: "fadeSlideIn 0.28s ease both" }}>

      {/* Header */}
      <div className="bj-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 className="bj-title">Resources</h2>
          <p className="bj-sub">Explore study materials and interview prep</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '10px 20px', borderRadius: '20px',
            background: 'linear-gradient(90deg, #800000, #4a0000)',
            color: '#fff', fontSize: '13px', fontWeight: 700,
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(128,0,0,0.25)',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'none'}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Resource
        </button>
      </div>

      {/* Branches */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a2540', marginBottom: '12px' }}>Branches</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {Object.keys(branchCategories).map(branch => (
          <button key={branch}
            onClick={() => { setSelectedBranch(branch); setSelectedCategory(branchCategories[branch][0]); }}
            style={filterBtn(selectedBranch === branch)}
          >{branch}</button>
        ))}
      </div>

      {/* Categories */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a2540', marginBottom: '12px' }}>Categories</h3>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {branchCategories[selectedBranch].map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} style={filterBtn(selectedCategory === cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Resources Grid */}
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0a2540', marginBottom: '12px' }}>Resources</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {mergedItems.map((item, idx) => (
          <div key={idx} style={{
            background: '#fff', borderRadius: '12px', padding: '20px',
            border: item.status === 'approved' ? '1px solid #fee2e2' : '1px solid #e8ecf0',
            boxShadow: '0 2px 8px rgba(10,37,64,0.04)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(10,37,64,0.09)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(10,37,64,0.04)'; }}
          >
            <div>
              {item.status === 'approved' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#800000', background: '#fdf2f2', padding: '2px 8px', borderRadius: '20px', marginBottom: '8px', border: '1px solid #fee2e2', textTransform: 'uppercase' }}>
                  ✓ Community
                </span>
              )}
              <h4 onClick={() => openLink(item.link)}
                style={{ fontSize: '15px', fontWeight: 700, color: '#0a2540', marginBottom: '8px', lineHeight: 1.4, cursor: 'pointer' }}>
                {item.title}
              </h4>
              {item.description && <p style={{ fontSize: '13px', color: '#8492a6', marginBottom: '12px' }}>{item.description}</p>}
            </div>
            <div style={{ marginTop: '16px' }}>
              <button onClick={() => openLink(item.link)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: 'linear-gradient(90deg, rgba(128,0,0,0.1) 0%, rgba(128,0,0,0.05) 100%)',
                  color: '#800000', padding: '8px 16px', borderRadius: '20px',
                  border: '1px solid #800000', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#800000'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(90deg, rgba(128,0,0,0.1) 0%, rgba(128,0,0,0.05) 100%)'; e.currentTarget.style.color = '#800000'; }}
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

      {/* Add Resource Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '36px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 60px rgba(10,37,64,0.18)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0a2540', marginBottom: '4px' }}>Add a Resource</h3>
            <p style={{ fontSize: '13px', color: '#8492a6', marginBottom: '24px' }}>Your submission will be reviewed by an admin before it appears.</p>

            {submitted ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
                <p style={{ fontWeight: 700, color: '#800000', fontSize: '16px' }}>Submitted for admin approval!</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#8492a6', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Resource Title</label>
                  <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. GeeksForGeeks DSA Sheet"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e8ecf0', fontSize: '14px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#800000'} onBlur={e => e.target.style.borderColor = '#e8ecf0'}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#8492a6', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Link</label>
                  <input required type="url" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e8ecf0', fontSize: '14px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#800000'} onBlur={e => e.target.style.borderColor = '#e8ecf0'}
                  />
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#8492a6', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Branch</label>
                    <select value={formData.branch}
                      onChange={e => setFormData({ ...formData, branch: e.target.value, category: getCatsForBranch(e.target.value)[0] })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e8ecf0', fontSize: '14px', fontWeight: 600, outline: 'none', background: '#fff', cursor: 'pointer' }}>
                      {ALL_BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#8492a6', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '6px' }}>Category</label>
                    <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '2px solid #e8ecf0', fontSize: '14px', fontWeight: 600, outline: 'none', background: '#fff', cursor: 'pointer' }}>
                      {getCatsForBranch(formData.branch).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setShowModal(false)}
                    style={{ padding: '10px 20px', borderRadius: '12px', border: '1px solid #e8ecf0', background: '#f9fafb', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#4b5563' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ padding: '10px 24px', borderRadius: '12px', background: 'linear-gradient(90deg, #800000, #4a0000)', color: '#fff', fontSize: '13px', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(128,0,0,0.25)' }}>
                    Submit for Approval
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
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
        fetchAppliedJobs();
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
      case 'events': return <Events />;
      case 'competitions': return <Competitions />;
      case 'announcements': return <Announcements role="student" />;
      case 'resources': return <ResourcesSection />;
      case 'help': return <HelpSupport />;
      default: return <HomeContent />;
    }
  };

  return (
    <div className="db-root student-dashboard">
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