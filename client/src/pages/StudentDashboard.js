import React, { useEffect, useState } from "react";
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
import { getAppliedJobs } from "../services/studentService";
import BrowseJobs from "../components/dashboard/BrowseJobs";
import Profile from "./Profile";
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
    id: app.application_id,
    title: app.title || "Job Position",
    company: app.company_name || "Company",
    appliedDate: app.applied_at ? new Date(app.applied_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A",
    status: app.status || "Applied",
    progress: Math.round(((currentStep + 1) / steps.length) * 100),
    steps,
    currentStep,
    isRejected,
    ctc: app.ctc
  };
}

export default function StudentDashboard() {
  const [activePage, setActivePage] = useState('home');
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const data = await getAppliedJobs(userId);
          const mapped = Array.isArray(data) ? data.map(mapApplicationToDisplayFormat) : [];
          setAppliedJobs(mapped);
        } catch (err) {
          console.error("Error fetching applied jobs:", err);
        }
      }
    };
    fetchAppliedJobs();
  }, []);

  const renderCenter = () => {
    switch (activePage) {
      case 'home': return <HomeContent />;
      case 'jobs': return <BrowseJobs />;
      case 'applied-jobs': return <AppliedJobs jobs={appliedJobs} />;
      case 'profile': return <Profile isPortal={true} />;
      case 'interviews': return <Interviews />;
      case 'assessments': return <Assessments />;
      case 'events': return <Events />;
      case 'competitions': return <Competitions />;
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