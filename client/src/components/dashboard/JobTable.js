import React from 'react';
import EmptyState from '../EmptyState';

export const CompanyLogo = ({ job }) => {
  const name = job.company_name || job.company || 'CO';
  return (
    <div
      className="job-logo-abbr"
      style={{ background: job.logoColor || '#800000' }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
};

export const JobTableRow = ({ job, applyingId, hasPhone, handleApply }) => (
  <tr key={job.id}>
    <td className="bj-logo-cell">
      <CompanyLogo job={job} />
    </td>
    <td>
      <div className="bj-role-text">
        {job.role || job.title}
        {job.is_off_campus && <span style={{ marginLeft: '8px', fontSize: '12px' }} title="Off-Campus Opportunity">🚀</span>}
      </div>
      <div className="bj-company-text">
        {job.company_name || job.company || 'Company'}
        {job.is_off_campus && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#800000', fontWeight: 'bold' }}>[Off-Campus]</span>}
      </div>
    </td>
    <td className="bj-desc-cell">
      {job.description ? (
        job.description.length > 80 ? job.description.slice(0, 80) + '...' : job.description
      ) : 'No description available'}
    </td>
    <td className="bj-package-text">
       {job.package || job.ctc || 'N/A'}
    </td>
    <td className="bj-cgpa-text">
      {job.is_off_campus ? 'Any' : (job.eligibility_cgpa || job.min_cgpa || 'Any')}
    </td>
    <td className="bj-deadline-text">
      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
    </td>
    <td>
      <span className={`bj-status-badge ${job.applied ? 'bj-status-applied' : 'bj-status-not-applied'}`}>
        {job.is_off_campus ? 'External' : (job.applied ? 'Applied' : 'Not Applied')}
      </span>
    </td>
    <td className="bj-action-cell">
      {job.is_off_campus ? (
        <button 
          className="bj-table-apply-btn" 
          onClick={() => window.open(job.job_link || job.source_url, '_blank')}
        >
          Apply Externally
        </button>
      ) : (
        <button 
          className="bj-table-apply-btn" 
          onClick={() => handleApply(job.id)}
          disabled={applyingId === job.id || job.applied || !hasPhone}
        >
          {!hasPhone ? 'Phone Required' : job.applied ? 'Applied' : applyingId === job.id ? 'Applying...' : 'Apply Now'}
        </button>
      )}
    </td>
  </tr>
);

export const JobTable = ({ jobs, applyingId, hasPhone, handleApply, emptyMessage, onRefresh }) => {
  if (jobs.length === 0) {
    if (onRefresh) {
        return (
            <EmptyState
                icon="💼"
                title="No jobs available right now"
                subtitle="New positions are posted regularly. Check back soon!"
                action={{ label: "Refresh", onClick: onRefresh }}
            />
        );
    }
    return (
        <div className="bg-[#800000]/5 border border-dashed border-[#800000]/20 rounded-xl p-8 text-center">
            <p className="text-[#800000] font-medium">{emptyMessage || 'No jobs match your criteria'}</p>
        </div>
    );
  }

  return (
    <div className="bj-table-container">
      <table className="bj-table">
        <thead>
          <tr>
            <th>Logo</th>
            <th>Job Role & Company</th>
            <th>Description</th>
            <th style={{ textAlign: 'center' }}>Package</th>
            <th style={{ textAlign: 'center' }}>Min CGPA</th>
            <th style={{ textAlign: 'center' }}>Deadline</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map(job => (
            <JobTableRow 
              key={job.id} 
              job={job} 
              applyingId={applyingId} 
              hasPhone={hasPhone} 
              handleApply={handleApply} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};
