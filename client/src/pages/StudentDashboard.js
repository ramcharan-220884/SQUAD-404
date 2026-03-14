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
import JobBoard from "./JobBoard";
import Profile from "./Profile";
import '../styles/dashboard.css';

export default function StudentDashboard() {
  const [activePage, setActivePage] = useState('home');
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          const data = await getAppliedJobs(userId);
          setAppliedJobs(data);
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
      case 'jobs': return <JobBoard isPortal={true} />;
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