import React, { useState } from 'react';

// Static Job Data (No backend API calls)
const staticJobListings = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'TCS',
    logoType: 'abbr',
    logoColor: '#0052cc',
    location: 'Hyderabad',
    ctc: '7.5 LPA',
    type: 'Full-Time',
    skills: ['Java', 'Spring Boot', 'SQL'],
    deadline: '2025-04-10',
    badge: 'Hot',
    badgeColor: '#ef4444',
  },
  {
    id: 2,
    title: 'Data Scientist',
    company: 'Infosys',
    logoType: 'abbr',
    logoColor: '#007cc2',
    location: 'Bangalore',
    ctc: '8.5 LPA',
    type: 'Full-Time',
    skills: ['Python', 'ML', 'Pandas'],
    deadline: '2025-04-15',
    badge: 'New',
    badgeColor: '#800000',
  },
  {
    id: 3,
    title: 'Frontend Intern',
    company: 'Wipro',
    logoType: 'abbr',
    logoColor: '#9b59b6',
    location: 'Remote',
    ctc: '3.5 LPA',
    type: 'Internship',
    skills: ['React', 'CSS', 'JS'],
    deadline: '2025-04-20',
    badge: 'Closing Soon',
    badgeColor: '#f59e0b',
  },
  {
    id: 4,
    title: 'Cloud Associate',
    company: 'HCL Tech',
    logoType: 'abbr',
    logoColor: '#e91e63',
    location: 'Chennai',
    ctc: '5.5 LPA',
    type: 'Full-Time',
    skills: ['AWS', 'Linux'],
    deadline: '2025-04-25',
    badge: null,
  },
  {
    id: 5,
    title: 'Backend Developer',
    company: 'Remote Tech',
    logoType: 'abbr',
    logoColor: '#2c3e50',
    location: 'Remote',
    ctc: '10 LPA',
    type: 'Remote',
    skills: ['Node.js', 'Express', 'MongoDB'],
    deadline: '2025-05-01',
    badge: 'Hot',
    badgeColor: '#ef4444',
  },
  {
    id: 6,
    title: 'System Analyst',
    company: 'Accenture',
    logoType: 'abbr',
    logoColor: '#a100ff',
    location: 'Mumbai',
    ctc: '7.0 LPA',
    type: 'Full-Time',
    skills: ['Java', 'Agile', 'SDLC'],
    deadline: '2025-05-05',
    badge: 'New',
    badgeColor: '#800000',
  },
  {
    id: 7,
    title: 'Product Design Intern',
    company: 'Creative Studio',
    logoType: 'abbr',
    logoColor: '#f1c40f',
    location: 'Pune',
    ctc: '4.0 LPA',
    type: 'Internship',
    skills: ['Figma', 'UI/UX'],
    deadline: '2025-05-10',
    badge: 'New',
    badgeColor: '#800000',
  },
  {
    id: 8,
    title: 'DevOps Engineer',
    company: 'Cloud Scale',
    logoType: 'abbr',
    logoColor: '#3498db',
    location: 'Remote',
    ctc: '12 LPA',
    type: 'Remote',
    skills: ['Docker', 'K8s', 'CI/CD'],
    deadline: '2025-05-15',
    badge: 'Hot',
    badgeColor: '#ef4444',
  },
  {
    id: 9,
    title: 'Java Developer',
    company: 'Cognizant',
    logoType: 'abbr',
    logoColor: '#003399',
    location: 'Kolkata',
    ctc: '6.5 LPA',
    type: 'Full-Time',
    skills: ['Java', 'Spring', 'AWS'],
    deadline: '2025-05-20',
    badge: 'Closing Soon',
    badgeColor: '#f59e0b',
  },
];

function CompanyLogo({ job }) {
  return (
    <div
      className="job-logo-abbr"
      style={{ background: job.logoColor || '#800000' }}
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
      ? staticJobListings
      : staticJobListings.filter((j) => j.type === filter);

  return (
    <div className="bj-root">
      {/* Page Header */}
      <div className="bj-top">
        <div>
          <h2 className="bj-title">Browse Jobs</h2>
          <p className="bj-sub">
            {staticJobListings.length} opportunities available · Apply before deadlines
          </p>
        </div>
        {/* Filter Buttons */}
        <div className="bj-filters">
          {filters.map((f) => (
            <button
              key={f}
              className={`bj-filter-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Job Cards Grid */}
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

            {/* Skill Tags */}
            <div className="bj-skills">
              {job.skills.map((s) => (
                <span key={s} className="bj-skill">{s}</span>
              ))}
            </div>

            {/* Info Row (Location, Salary, Deadline) */}
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
            <button className="bj-apply-btn">Apply Now</button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bj-empty">No jobs match this filter.</div>
      )}
    </div>
  );
}

