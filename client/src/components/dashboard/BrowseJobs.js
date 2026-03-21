import React, { useState, useEffect } from 'react';
import { getAvailableJobs, applyForJob } from '../../services/studentService';
import { useNotification } from '../../context/NotificationContext';
import { SkeletonCard } from '../LoadingSpinner';
import EmptyState from '../EmptyState';

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

export default function BrowseJobs({ onJobApplied }) {
  const { showNotification } = useNotification();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchJobs();
  }, [currentPage]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const data = await getAvailableJobs();
      // Since the current backend getAvailableJobs is a simple list
      setJobs(Array.isArray(data) ? data : []);
      setTotalPages(1); // Reset pagination for flat list
    } catch (err) {
      console.error("Error fetching jobs:", err);
      showNotification("Failed to fetch available jobs", "error", "student");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    setApplyingId(jobId);
    try {
      await applyForJob(jobId);
      showNotification("Application submitted successfully!", "success", "student");
      // Add a dummy application status temporarily so button disables instantly
      setJobs(prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, applied: true } : job
      ));

      // Notify parent to fetch new applied jobs
      if (onJobApplied) onJobApplied();
      
      await fetchJobs();
    } catch (err) {
      console.error("Error applying:", err);
      showNotification("Failed to submit application. Please try again.", "error", "student");
    } finally {
      setApplyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bj-root">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '16px' }}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
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
        {jobs.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              icon="💼"
              title="No jobs available right now"
              subtitle="New positions are posted regularly. Check back soon!"
              action={{ label: "Refresh", onClick: fetchJobs }}
            />
          </div>
        ) : (
          jobs.map((job) => (

            <div key={job.id} className="bj-card">
              {/* Card Header */}
              <div className="bj-card-header">
                <CompanyLogo job={job} />
                <div className="bj-card-meta">
                  <h3 className="bj-card-title">{job.role || job.title}</h3>
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
                  💰 {job.package || job.ctc || 'Not specified'}
                </span>
                <span className="bj-info-pill">
                  🎓 Min CGPA: {job.eligibility_cgpa || job.min_cgpa || 'Any'}
                </span>
                {job.deadline && (
                   <span className="bj-info-pill">
                     📅 Deadline: {new Date(job.deadline).toLocaleDateString()}
                   </span>
                )}
              </div>

              {/* Apply Button */}
              <button 
                className="bj-apply-btn" 
                onClick={() => handleApply(job.id)}
                disabled={applyingId === job.id || job.applied}
                style={(applyingId === job.id || job.applied) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
              >
                {job.applied ? 'Applied' : applyingId === job.id ? 'Applying...' : 'Apply Now'}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination View (Simplified) */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fff', cursor: 'pointer' }}
          >
            Previous
          </button>
          <span style={{ fontWeight: 'bold', color: '#555' }}>Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #eee', background: '#fff', cursor: 'pointer' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
