import React from 'react';
import JobProgressBar from './JobProgressBar';

const AppliedJobsList = ({ jobs }) => {
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
            <button className="view-details-btn">View Details</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AppliedJobsList;
