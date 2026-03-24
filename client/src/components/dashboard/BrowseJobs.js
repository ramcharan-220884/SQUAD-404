import React, { useState, useEffect } from 'react';
import { getAvailableJobs, applyForJob, getProfile } from '../../services/studentService';
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
  const [allJobs, setAllJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [hasPhone, setHasPhone] = useState(true);
  const [studentSkills, setStudentSkills] = useState([]);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);


  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const [jobsData, profile] = await Promise.all([
        getAvailableJobs(),
        getProfile()
      ]);

      const availableJobs = Array.isArray(jobsData) ? jobsData : [];
      setAllJobs(availableJobs);
      
      let normalizedSkills = [];
      if (profile) {
        setHasPhone(!!(profile.phone && profile.phone.trim() !== ''));
        
        const rawSkills = profile.skills || '';
        if (typeof rawSkills === 'string') {
          normalizedSkills = rawSkills.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== '');
        } else if (Array.isArray(rawSkills)) {
          normalizedSkills = rawSkills.map(s => s.toString().trim().toLowerCase()).filter(s => s !== '');
        }
        setStudentSkills(normalizedSkills);
      }

      // Smart Filtering Logic
      if (normalizedSkills.length > 0) {
        const filtered = availableJobs.map(job => {
          const jobSkillsRaw = job.skills || '';
          let jobSkills = [];
          if (typeof jobSkillsRaw === 'string') {
            jobSkills = jobSkillsRaw.split(',').map(s => s.trim().toLowerCase()).filter(s => s !== '');
          } else if (Array.isArray(jobSkillsRaw)) {
            jobSkills = jobSkillsRaw.map(s => s.toString().trim().toLowerCase()).filter(s => s !== '');
          }
          
          const matches = normalizedSkills.filter(skill => 
            jobSkills.some(js => js.includes(skill) || skill.includes(js))
          );
          
          return { ...job, matchCount: matches.length };
        })
        .filter(job => job.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount);

        setFilteredJobs(filtered);
      } else {
        setFilteredJobs([]);
      }

      setTotalPages(1);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      showNotification("Failed to fetch available jobs", "error", "student");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId) => {
    if (!hasPhone) {
      showNotification("Please complete your profile (phone number required to apply)", "warning", "student");
      return;
    }
    setApplyingId(jobId);
    try {
      await applyForJob(jobId);
      showNotification("Application submitted successfully!", "success", "student");
      
      // Update local state instantly for better UX
      const updater = prevJobs => prevJobs.map(job => 
        job.id === jobId ? { ...job, applied: true } : job
      );
      setAllJobs(updater);
      setFilteredJobs(updater);

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

  const renderJobCard = (job) => (
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
        disabled={applyingId === job.id || job.applied || !hasPhone}
        style={(applyingId === job.id || job.applied || !hasPhone) ? { opacity: 0.6, cursor: 'not-allowed' } : {}}
      >
        {!hasPhone ? 'Phone Required' : job.applied ? 'Applied' : applyingId === job.id ? 'Applying...' : 'Apply Now'}
      </button>
    </div>
  );

  return (
    <div className="bj-root" style={{ paddingBottom: '40px' }}>
      {/* 1. Recommended Jobs Section */}
      <div className="bj-section mb-10">
        <div className="bj-top mb-6">
          <h2 className="bj-title">Recommended Jobs for You</h2>
          <p className="bj-sub">Skill-matched opportunities tailored for your profile</p>
        </div>

        <div className="bj-grid">
          {filteredJobs.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="bg-[#800000]/5 border border-dashed border-[#800000]/20 rounded-xl p-8 text-center">
                <p className="text-[#800000] font-medium">No jobs match your skills yet</p>
                <p className="text-sm text-gray-500 mt-1">Try adding more skills to your profile to see recommendations here.</p>
              </div>
            </div>
          ) : (
            filteredJobs.map(renderJobCard)
          )}
        </div>
      </div>

      <hr className="border-gray-100 dark:border-slate-800 my-10" />

      {/* 2. All Jobs Section */}
      <div className="bj-section">
        <div className="bj-top mb-6">
          <h2 className="bj-title">All Jobs</h2>
          <p className="bj-sub">{allJobs.length} total opportunities available</p>
        </div>

        <div className="bj-grid">
          {allJobs.length === 0 ? (
            <div style={{ gridColumn: '1 / -1' }}>
              <EmptyState
                icon="💼"
                title="No jobs available right now"
                subtitle="New positions are posted regularly. Check back soon!"
                action={{ label: "Refresh", onClick: fetchJobs }}
              />
            </div>
          ) : (
            allJobs.map(renderJobCard)
          )}
        </div>
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
