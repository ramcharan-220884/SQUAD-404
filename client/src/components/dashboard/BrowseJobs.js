import React, { useState, useEffect } from 'react';
import { getAvailableJobs, applyForJob, getProfile } from '../../services/studentService';
import { useNotification } from '../../context/NotificationContext';
import { SkeletonCard } from '../LoadingSpinner';
import EmptyState from '../EmptyState';
import { JobTable } from './JobTable';

// Removed local JobTableRow and JobTable as they are now in shared JobTable.js

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

  return (

    <div className="bj-root" style={{ paddingBottom: '40px' }}>
      {/* 1. Recommended Jobs Section */}
      <div className="bj-section mb-10">
        <div className="bj-top mb-6">
          <h2 className="bj-title">Recommended Jobs for You</h2>
          <p className="bj-sub">Skill-matched opportunities tailored for your profile</p>
        </div>

        <div className="bj-content">
          <JobTable 
            jobs={filteredJobs} 
            applyingId={applyingId} 
            hasPhone={hasPhone} 
            handleApply={handleApply}
            emptyMessage="No jobs match your skills yet. Try adding more skills to your profile."
          />
        </div>
      </div>

      <hr className="border-gray-100 dark:border-slate-800 my-10" />

      {/* 2. All Jobs Section */}
      <div className="bj-section">
        <div className="bj-top mb-6">
          <h2 className="bj-title">All Jobs</h2>
          <p className="bj-sub">{allJobs.length} total opportunities available</p>
        </div>

        <div className="bj-content">
          <JobTable 
            jobs={allJobs} 
            applyingId={applyingId} 
            hasPhone={hasPhone} 
            handleApply={handleApply}
            onRefresh={fetchJobs}
          />
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
