import React, { useState } from 'react';
import { jobListings } from '../../assets/images/dashboardData';

function CompanyLogo({ job }) {
  if (job.logoType === 'image' && job.logo) {
    return (
      <div className="job-logo-wrap">
        <img src={job.logo} alt={job.company} className="job-logo-img" />
      </div>
    );
  }
  // SVG-based abbreviation badge (no external URLs)
  return (
    <div
      className="job-logo-abbr"
      style={{ background: job.logoColor || '#1a73e8' }}
    >
      {job.company.slice(0, 2).toUpperCase()}
    </div>
  );
}

export default function BrowseJobs() {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Full-Time', 'Internship', 'Remote'];

  const filtered =
    filter === 'All'
      ? jobListings
      : jobListings.filter((j) => j.type === filter);

  return (
    <div className="bj-root">
      {/* Page Header */}
      <div className="bj-top">
        <div>
          <h2 className="bj-title">Browse Jobs</h2>
          <p className="bj-sub">
            {jobListings.length} opportunities available · Apply before deadlines
          </p>
        </div>
        {/* Filter Pills */}
        <div className="bj-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`bj-filter-pill${filter === f ? ' active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid — rendered dynamically from jobListings[] */}
      <div className="bj-grid">
        {filtered.map((job) => (
          <div key={job.id} className="bj-card">
            {/* Card Header */}
            <div className="bj-card-header">
              <CompanyLogo job={job} />
              <div className="bj-card-meta">
                <h3 className="bj-card-title">{job.title}</h3>
                <p className="bj-card-company">{job.company}</p>
              </div>
              {job.badge && (
                <span
                  className="bj-badge"
                  style={{ background: job.badgeColor + '1a', color: job.badgeColor }}
                >
                  {job.badge}
                </span>
              )}
            </div>

            {/* Skills */}
            <div className="bj-skills">
              {job.skills.map((s) => (
                <span key={s} className="bj-skill">{s}</span>
              ))}
            </div>

            {/* Meta Row */}
            <div className="bj-info-row">
              <span className="bj-info-pill">
                📍 {job.location}
              </span>
              <span className="bj-info-pill">
                💰 {job.ctc}
              </span>
              <span className="bj-info-pill">
                📅 {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
            </div>

            {/* Apply Button */}
            <button className="bj-apply-btn">Apply Now →</button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bj-empty">No jobs match this filter.</div>
      )}
    </div>
  );
}
