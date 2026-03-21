import React from 'react';
import AppliedJobsList from './AppliedJobsList';

const AppliedJobs = ({ jobs = [], onRefresh }) => {
  return (
    <div className="applied-jobs-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Applied Jobs Dashboard</h2>
          <p className="section-subtitle">Track your recruitment progress across all applications.</p>
        </div>
        <div className="section-stats">
          <div className="stat-pill">
            <span className="stat-value">{jobs.length}</span>
            <span className="stat-label">Total Applications</span>
          </div>
          <div className="stat-pill active">
            <span className="stat-value">
              {jobs.filter(j => !j.isRejected && j.status !== 'Selected').length}
            </span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#999' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#555', marginBottom: '8px' }}>No Applications Yet</h3>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>Browse available jobs and start applying to track your progress here.</p>
        </div>
      ) : (
        <AppliedJobsList jobs={jobs} onRefresh={onRefresh} />
      )}
    </div>
  );
};

export default AppliedJobs;
