import React from 'react';
import { appliedJobsData } from '../../data/appliedJobsData';
import AppliedJobsList from './AppliedJobsList';

const AppliedJobs = () => {
  return (
    <div className="applied-jobs-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Applied Jobs Dashboard</h2>
          <p className="section-subtitle">Track your recruitment progress across all applications.</p>
        </div>
        <div className="section-stats">
          <div className="stat-pill">
            <span className="stat-value">{appliedJobsData.length}</span>
            <span className="stat-label">Total Applications</span>
          </div>
          <div className="stat-pill active">
            <span className="stat-value">
              {appliedJobsData.filter(j => !j.isRejected && j.status !== 'Selected').length}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </div>

      <AppliedJobsList jobs={appliedJobsData} />
    </div>
  );
};

export default AppliedJobs;
