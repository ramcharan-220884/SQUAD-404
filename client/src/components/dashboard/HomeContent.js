import React, { useEffect, useState } from 'react';
import API_BASE from '../../services/api';

function StatCard({ value, label, iconClass, icon }) {
  return (
    <div className="home-stat-card">
      <div className={`home-stat-icon ${iconClass}`}>{icon}</div>
      <div>
        <div className="home-stat-value">{value}</div>
        <div className="home-stat-label">{label}</div>
      </div>
    </div>
  );
}

function CompanyLogo({ opp }) {
  return (
    <div
      className="job-logo-abbr"
      style={{ background: '#800000', width: '40px', height: '40px', fontSize: '13px' }}
    >
      {(opp.company_name || opp.company || 'CO').slice(0, 2).toUpperCase()}
    </div>
  );
}

function getDeadlineInfo(dateString) {
  if (!dateString) return { text: 'Open', color: '#38a169', bg: '#c6f6d5' };
  const deadline = new Date(dateString);
  const now = new Date();

  deadline.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { text: 'Closed', color: '#8492a6', bg: '#f4f7fb' };
  if (diffDays === 0) return { text: 'Last Day', color: '#e53e3e', bg: '#fed7d7' };
  if (diffDays < 3) return { text: `${diffDays} Days Left`, color: '#e53e3e', bg: '#fed7d7' };
  if (diffDays <= 6) return { text: `${diffDays} Days Left`, color: '#d69e2e', bg: '#fefcbf' };
  return { text: `${diffDays} Days Left`, color: '#38a169', bg: '#c6f6d5' };
}

export default function HomeContent() {
  const [stats, setStats] = useState({ applicationsSent: 0, shortlisted: 0, openJobs: 0 });
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");

        // Fetch jobs
        const jobsRes = await fetch(`${API_BASE}/jobs/all`);
        const jobsData = await jobsRes.json();
        setJobs(Array.isArray(jobsData) ? jobsData.slice(0, 5) : []);

        // Fetch student application stats
        if (userId) {
          const appsRes = await fetch(`${API_BASE}/applications/student/${userId}`);
          const appsData = await appsRes.json();
          const apps = Array.isArray(appsData) ? appsData : [];
          setStats({
            applicationsSent: apps.length,
            shortlisted: apps.filter(a => a.status === 'Shortlisted' || a.status === 'Selected').length,
            openJobs: Array.isArray(jobsData) ? jobsData.length : 0
          });
        } else {
          setStats(prev => ({ ...prev, openJobs: Array.isArray(jobsData) ? jobsData.length : 0 }));
        }
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApply = async (jobId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to apply for jobs.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/applications/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: parseInt(userId), job_id: jobId })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
        setStats(prev => ({ ...prev, applicationsSent: prev.applicationsSent + 1 }));
      } else {
        alert(data.message || "Failed to apply.");
      }
    } catch (err) {
      console.error("Error applying:", err);
      alert("Error submitting application.");
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ color: '#888', fontWeight: 600 }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Quick Stats — Live Data */}
      <div className="home-stats-grid">
        <StatCard
          value={String(stats.applicationsSent)}
          label="Applications Sent"
          iconClass="maroon"
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
            </svg>
          }
        />
        <StatCard
          value={String(stats.shortlisted)}
          label="Shortlisted"
          iconClass="green"
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          value={String(stats.openJobs)}
          label="Open Opportunities"
          iconClass="purple"
          icon={
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.223v-4.073M20.25 14.15A11.227 11.227 0 0012 17.25c-3.18 0-6.085-.666-8.25-1.748M20.25 14.15V9.375c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125v4.775M9 9.375v-1.5a3 3 0 116 0v1.5" />
            </svg>
          }
        />
      </div>

      {/* Open Opportunities — Live from Database */}
      <div className="home-opp-section">
        <h2 className="home-opp-title">Open Opportunities</h2>
        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
            <p style={{ fontWeight: 600 }}>No open opportunities at the moment.</p>
          </div>
        ) : (
          <div className="home-opp-grid">
            {jobs.map(opp => {
              const deadlineInfo = getDeadlineInfo(opp.deadline || opp.created_at);
              return (
                <div key={opp.job_id} className="home-opp-card">
                  <div className="home-opp-header">
                    <CompanyLogo opp={opp} />
                    <div className="home-opp-meta">
                      <h3 className="home-opp-comp">{opp.company_name || 'Company'}</h3>
                      <p className="home-opp-role">{opp.title}</p>
                    </div>
                    <div 
                      className="home-opp-deadline" 
                      style={{ color: deadlineInfo.color, backgroundColor: deadlineInfo.bg }}
                    >
                      {deadlineInfo.text}
                    </div>
                  </div>

                  <div className="home-opp-details">
                    <div className="home-opp-pill">🎓 Min CGPA: {opp.min_cgpa || 'Any'}</div>
                    <div className="home-opp-pill">💰 {opp.ctc || 'Not specified'}</div>
                  </div>

                  <button className="home-opp-btn" onClick={() => handleApply(opp.job_id)}>Apply Now →</button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
