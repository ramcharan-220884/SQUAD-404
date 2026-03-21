import React, { useState } from 'react';
import JobProgressBar from './JobProgressBar';
import { useNotification } from '../../context/NotificationContext';
import { withdrawApplication } from '../../services/studentService';
import { X, MapPin, Briefcase, DollarSign, Calendar, GraduationCap, ClipboardList, Building } from 'lucide-react';

const AppliedJobsList = ({ jobs, onRefresh }) => {
  const [selectedJob, setSelectedJob] = useState(null);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { showNotification } = useNotification();

  const handleWithdraw = async () => {
    if (!selectedJob) return;
    
    setIsWithdrawing(true);
    try {
      const res = await withdrawApplication(selectedJob.id);
      if (res.success) {
        showNotification("Application withdrawn successfully", "success", "student");
        setSelectedJob(null);
        setShowWithdrawConfirm(false);
        if (onRefresh) onRefresh();
        // Fallback: If no onRefresh, the user might need to reload, but we'll try to trigger it from parent.
      } else {
        showNotification(res.message || "Failed to withdraw application", "error", "student");
      }
    } catch (err) {
      console.error("Error withdrawing:", err);
      showNotification("Error connecting to server", "error", "student");
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="applied-jobs-list">
      {jobs.map((job) => (
        <div key={job.id} className="applied-job-card">
          <div className="job-card-header">
            <div className="job-info">
              <div className="job-icon">
                {job.company.charAt(0)}
              </div>
              <div>
                <h3 className="job-title">{job.title}</h3>
                <p className="job-company">{job.company}</p>
              </div>
            </div>
            <div className="job-meta">
              <span className="job-date">Applied on {job.appliedDate}</span>
              <span className={`job-status-badge ${job.isRejected ? 'rejected' : job.status === 'Selected' ? 'selected' : 'active'}`}>
                {job.status}
              </span>
            </div>
          </div>
          
          <div className="job-card-body">
            <h4 className="progress-label">Application Progress</h4>
            <JobProgressBar 
              steps={job.steps} 
              currentStep={job.currentStep} 
              isRejected={job.isRejected} 
            />
          </div>
          
          <div className="job-card-footer">
            <button className="view-details-btn" onClick={() => setSelectedJob(job)}>View Details</button>
          </div>
        </div>
      ))}

      {/* Modern Centered Modal for Job Details */}
      {selectedJob && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-maroon-600 flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: '#800000' }}>
                  {selectedJob.company.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedJob.title}</h2>
                  <p className="text-sm font-medium text-gray-500">{selectedJob.company}</p>
                </div>
              </div>
              <button 
                onClick={() => { setSelectedJob(null); setShowWithdrawConfirm(false); }}
                className="p-2 rounded-xl hover:bg-gray-200/50 text-gray-400 hover:text-gray-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 font-['Poppins']">
              
              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                  <DollarSign className="w-5 h-5 text-maroon-600 mb-2" style={{ color: '#800000' }} />
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">CTC</span>
                  <span className="text-sm font-bold text-gray-900">{selectedJob.ctc || 'N/A'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                  <MapPin className="w-5 h-5 text-maroon-600 mb-2" style={{ color: '#800000' }} />
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Location</span>
                  <span className="text-sm font-bold text-gray-900">{selectedJob.location || 'Remote'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                  <Briefcase className="w-5 h-5 text-maroon-600 mb-2" style={{ color: '#800000' }} />
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Type</span>
                  <span className="text-sm font-bold text-gray-900">{selectedJob.job_type || 'Full-time'}</span>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center text-center">
                  <Calendar className="w-5 h-5 text-maroon-600 mb-2" style={{ color: '#800000' }} />
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Deadline</span>
                  <span className="text-sm font-bold text-gray-900">{selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-extrabold text-[#052c42] uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
                  <ClipboardList size={16} /> Job Description
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  {selectedJob.description || "No detailed description provided by the company."}
                </p>
              </div>

              {/* Requirements Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-extrabold text-[#052c42] uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
                    <GraduationCap size={16} /> Eligibility
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 italic">
                      <span className="text-xs text-gray-500 font-medium">Min CGPA:</span>
                      <span className="text-xs font-bold text-gray-800">{selectedJob.min_cgpa || 'Any'}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 italic">
                      <span className="text-xs text-gray-500 font-medium">Allowed Backlogs:</span>
                      <span className="text-xs font-bold text-gray-800">{selectedJob.allowed_backlogs ?? 'Any'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold text-[#052c42] uppercase tracking-[0.1em] mb-3 flex items-center gap-2">
                    <Building size={16} /> Target Branches
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      let branches = [];
                      try {
                        branches = typeof selectedJob.eligible_branches === 'string' 
                          ? JSON.parse(selectedJob.eligible_branches) 
                          : selectedJob.eligible_branches || [];
                      } catch (e) {
                        branches = [selectedJob.eligible_branches];
                      }
                      return branches.length > 0 ? branches.map((b, i) => (
                        <span key={i} className="px-3 py-1 bg-maroon-50 text-maroon-700 text-[11px] font-bold rounded-full border border-maroon-100/50" style={{ backgroundColor: '#fdf2f2', color: '#800000', borderColor: '#fee2e2' }}>
                          {b}
                        </span>
                      )) : <span className="text-xs text-gray-400">All branches eligible</span>;
                    })()}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {selectedJob.skills && (
                <div>
                  <h3 className="text-sm font-extrabold text-[#052c42] uppercase tracking-[0.1em] mb-3">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.skills.split(',').map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-[11px] font-bold rounded-lg border border-gray-200">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Withdraw Button */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col items-center gap-4">
              {!showWithdrawConfirm ? (
                <button 
                  onClick={() => setShowWithdrawConfirm(true)}
                  className="w-full py-4 rounded-2xl bg-white border-2 border-red-50 text-red-600 text-sm font-extrabold uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                >
                  Withdraw Application
                </button>
              ) : (
                <div className="w-full p-6 bg-red-600 rounded-3xl text-white shadow-xl animate-in zoom-in-95 duration-300">
                  <h4 className="text-base font-black mb-2 flex items-center gap-2">
                    <AlertCircle size={20} /> Confirm Withdrawal?
                  </h4>
                  <p className="text-xs font-medium text-red-50 mb-6 leading-relaxed">
                    This action is permanent. You will be removed from the applicant list and will need to re-apply if eligible.
                  </p>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleWithdraw}
                      disabled={isWithdrawing}
                      className="flex-1 py-3 bg-white text-red-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      {isWithdrawing ? 'Withdrawing...' : 'YES, WITHDRAW'}
                    </button>
                    <button 
                      onClick={() => setShowWithdrawConfirm(false)}
                      disabled={isWithdrawing}
                      className="flex-1 py-3 bg-red-700/50 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors"
                    >
                      CANCEL
                    </button>
                  </div>
                </div>
              )}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                Eduvate Placement Innovation Center
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple AlertCircle icon for confirmation
const AlertCircle = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export default AppliedJobsList;
