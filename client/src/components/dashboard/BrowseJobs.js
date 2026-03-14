import React, { useState, useEffect } from 'react';
import API_BASE from '../../services/api';

function CompanyLogo({ job }) {
  return (
    <div
      className="job-logo-abbr"
      style={{ background: job.logoColor || '#800000' }}
    >
      {(job.company_name || job.company || 'CO').slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function BrowseJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${API_BASE}/jobs/all`);
        const data = await res.json();
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please log in to apply for jobs.");
      return;
    }
    setApplyingId(jobId);
    try {
      const res = await fetch(`${API_BASE}/applications/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: parseInt(userId), job_id: jobId })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Application submitted successfully!");
      } else {
        alert(data.message || "Failed to apply.");
      }
    } catch (err) {
      console.error("Error applying:", err);
      alert("Error submitting application.");
    } finally {
      setApplyingId(null);
    }
  };

  const filtered = jobs; // All jobs from DB — no client-side type filtering needed

  if (loading) {
    return (
      <div className="bj-root" style={{ textAlign: 'center', padding: '40px' }}>
        <p style={{ color: '#888', fontWeight: 600 }}>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="bj-root">
      {/* Page Header */}
      <div className="bj-top">
        <div>
          <h2 className="bj-title">Browse Jobs</h2>
          <p className="bj-sub">
            {jobs.length} opportunities available · Apply before deadlines
          </p>
        </div>
      </div>

      {/* Job Cards Grid */}
      <div className="bj-grid">
        {filtered.length > 0 ? (
          filtered.map((job) => (
            <div key={job.job_id} className="bj-card">
              {/* Card Header */}
              <div className="bj-card-header">
                <CompanyLogo job={job} />
                <div className="bj-card-meta">
                  <h3 className="bj-card-title">{job.title}</h3>
                  <p className="bj-card-company">{job.company_name || 'Company'}</p>
                </div>
              </div>

              {/* Description */}
              {job.description && (
                <p style={{ fontSize: '13px', color: '#666', margin: '8px 0', lineHeight: 1.5 }}>
                  {job.description.length > 100 ? job.description.slice(0, 100) + '...' : job.description}
                </p>
              )}

              {/* Info Row */}
              <div className="bj-info-row">
                <span className="bj-info-pill">
                  💰 {job.ctc || 'Not specified'}
                </span>
                <span className="bj-info-pill">
                  🎓 Min CGPA: {job.min_cgpa || 'Any'}
                </span>
                {job.max_backlogs !== undefined && job.max_backlogs !== null && (
                  <span className="bj-info-pill">
                    📋 Max Backlogs: {job.max_backlogs}
                  </span>
                )}
              </div>

              {/* Apply Button */}
              <button 
                className="bj-apply-btn" 
                onClick={() => handleApply(job.job_id)}
                disabled={applyingId === job.job_id}
                style={applyingId === job.job_id ? { opacity: 0.6 } : {}}
              >
                {applyingId === job.job_id ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ))
        ) : (
          <div className="bj-empty">No jobs available at the moment. Check back soon!</div>
        )}
      </div>
    </div>
  );
}
