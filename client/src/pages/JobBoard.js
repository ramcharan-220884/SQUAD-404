import React, { useState, useEffect } from "react";
import { authFetch } from "../services/api";

export default function JobBoard({ isPortal = false }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Full-Time', 'Internship', 'Remote', 'Off-Campus'];

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const res = await authFetch("/jobs/all");
        const data = await res.json();
        if (data.success) {
          setJobs(data.data.jobs || []);
        }
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = filter === 'All' 
    ? jobs 
    : jobs.filter(job => {
        if (filter === 'Off-Campus') return job.is_off_campus;
        return job.type === filter;
      });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  return (
    <div className={`${isPortal ? '' : 'min-h-screen bg-gray-50/50 p-8'} animate-fade-in`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header and Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-[#0a2540] tracking-tight">Browse Jobs</h1>
            <p className="text-gray-500 font-medium">
              {jobs.length} opportunities available · Discover your next career move
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm gap-1 overflow-x-auto">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
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
                className="bg-white rounded-3xl border border-gray-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
              >
                {/* Off-Campus Badge */}
                {job.is_off_campus && (
                  <div className="absolute -top-3 left-6 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg z-10">
                    🚀 Off-Campus Opportunity
                  </div>
                )}

                {/* Card Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg"
                      style={{ background: job.is_off_campus ? '#3b82f6' : '#2c3e50' }}
                    >
                      {job.company_name?.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[#0a2540] text-lg group-hover:text-[#800000] transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-500 font-bold text-sm">{job.company_name}</p>
                    </div>
                  </div>
                </div>

                {/* Skills Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {(job.skills || []).map(skill => (
                    <span key={skill} className="px-3 py-1 bg-gray-50 border border-gray-100 text-gray-500 text-[11px] font-bold rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Job Metadata */}
                <div className="grid grid-cols-2 gap-4 mb-8 flex-grow">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Location</p>
                    <p className="text-sm font-bold text-[#0a2540] flex items-center gap-1.5">
                      <span className="text-red-400">📍</span> {job.location || 'Remote'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Salary</p>
                    <p className="text-sm font-bold text-[#0a2540] flex items-center gap-1.5">
                      <span className="text-green-500">💰</span> {job.ctc || 'N/A'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</p>
                    <p className="text-sm font-bold text-[#0a2540] flex items-center gap-1.5">
                      <span className="text-blue-400">💼</span> {job.type || 'Full-Time'}
                    </p>
                  </div>
                   <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Source</p>
                    <p className="text-[11px] font-bold text-gray-600">
                      {job.is_off_campus ? 'Verification Required' : (job.department || 'Campus Placement')}
                    </p>
                  </div>
                </div>

                {/* Apply Button */}
                {job.is_off_campus ? (
                  <button 
                    onClick={() => window.open(job.job_link || job.source_url, '_blank')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5"
                  >
                    👉 Apply Externally
                  </button>
                ) : (
                  <button className="w-full bg-[#800000] hover:bg-[#4a0000] text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#800000]/10 hover:shadow-[#800000]/20 active:scale-[0.98] transition-all">
                    Apply Now
                  </button>
                )}
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