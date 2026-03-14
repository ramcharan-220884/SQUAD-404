import React, { useState } from "react";

// Static Job Data (No backend API calls)
const staticJobListings = [
  {
    id: 1,
    title: 'Software Engineer',
    company: 'TCS',
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

export default function JobBoard({ isPortal = false }) {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Full-Time', 'Internship', 'Remote'];

  const filteredJobs = filter === 'All' 
    ? staticJobListings 
    : staticJobListings.filter(job => job.type === filter);

  return (
    <div className={`${isPortal ? '' : 'min-h-screen bg-gray-50/50 p-8'} animate-fade-in`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header and Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-[#0a2540] tracking-tight">Browse Jobs</h1>
            <p className="text-gray-500 font-medium">
              {staticJobListings.length} opportunities available · Discover your next career move
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  filter === f 
                    ? "bg-[#800000] text-white shadow-md" 
                    : "text-gray-500 hover:text-[#800000] hover:bg-[#800000]/5"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                      style={{ background: job.logoColor }}
                    >
                      {job.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0a2540] text-lg group-hover:text-[#800000] transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-500 font-bold text-sm">{job.company}</p>
                    </div>
                  </div>
                  {job.badge && (
                    <span 
                      className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                      style={{ background: `${job.badgeColor}15`, color: job.badgeColor }}
                    >
                      {job.badge}
                    </span>
                  )}
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-[11px] font-bold rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Job Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                    <p className="text-sm font-bold text-[#0a2540] flex items-center gap-1.5">
                      <span className="text-red-400">📍</span> {job.location}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Salary</p>
                    <p className="text-sm font-bold text-[#0a2540] flex items-center gap-1.5">
                      <span className="text-green-500">💰</span> {job.ctc}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Deadline</p>
                    <p className="text-sm font-bold text-[#0a2540] flex items-center gap-1.5">
                      <span className="text-orange-400">📅</span> {new Date(job.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                    <p className="text-sm font-bold text-[#0a2540] flex items-center gap-1.5">
                      <span className="text-blue-400">💼</span> {job.type}
                    </p>
                  </div>
                </div>

                {/* Apply Button */}
                <button className="w-full bg-[#800000] hover:bg-[#4a0000] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#800000]/10 hover:shadow-[#800000]/20 active:scale-[0.98] transition-all">
                  Apply Now
                </button>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="text-4xl">🔍</div>
              <p className="text-gray-400 font-bold">No jobs found matching "{filter}"</p>
              <button 
                onClick={() => setFilter('All')}
                className="text-[#800000] font-black uppercase tracking-widest text-xs hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}