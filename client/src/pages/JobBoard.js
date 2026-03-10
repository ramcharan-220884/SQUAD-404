import React, { useEffect, useState } from "react";
import { getJobs, applyJob } from "../services/jobService";

export default function JobBoard({ isPortal = false }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (job_id) => {
    try {
      const student_id = localStorage.getItem("userId");
      if (!student_id) {
        setError("You must be logged in as a student to apply.");
        return;
      }
      
      await applyJob({ job_id, student_id });
      setMessage("Applied successfully!");
      // Temporarily mark applied locally
      setJobs(jobs.map(job => job.job_id === job_id ? {...job, applied: true} : job));
      
      setTimeout(() => setMessage(""), 3000); // Clear message after 3s
    } catch (err) {
      setError(err.message || "Error applying for job. You may have already applied.");
      setTimeout(() => setError(""), 5000);
    }
  };

  if (loading) {
    return (
      <div className={`${isPortal ? 'h-full' : 'min-h-screen'} flex items-center justify-center bg-gray-50`}>
        <p className="text-xl text-gray-500 font-semibold animate-pulse">Loading job board...</p>
      </div>
    );
  }

  return (
    <div className={`${isPortal ? '' : 'min-h-screen bg-gray-50 p-8'} font-sans animate-fade-in`}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Job Board</h1>
            <p className="text-gray-500 mt-1">Discover and apply for the latest placement opportunities.</p>
          </div>
          
          <div className="relative w-full md:w-64">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
             </div>
             <input type="text" placeholder="Search jobs..." className="pl-10 w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#346b41] focus:border-transparent outline-none transition-all" />
          </div>
        </div>

        {/* Alerts */}
        {message && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow-sm flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
            <p className="text-green-700">{message}</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded shadow-sm flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={`job-${job.job_id}`} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-[#346b41]/10 text-[#346b41] p-2 rounded-lg">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                {job.applied && <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">Applied</span>}
              </div>
              
              <h2 className="text-xl font-bold text-gray-900 leading-tight mb-1">{job.title}</h2>
              <p className="text-[#346b41] font-semibold text-sm mb-4">{job.company_name}</p>

              <div className="space-y-2 mb-6 grow">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Salary
                  </span>
                  <span className="font-semibold text-gray-900">{job.ctc} LPA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center">
                     <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Min CGPA
                  </span>
                  <span className="font-semibold text-gray-900">{job.min_cgpa}</span>
                </div>
                {job.max_backlogs !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Max Backlogs
                    </span>
                    <span className="font-medium text-gray-900">{job.max_backlogs}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => handleApply(job.job_id)}
                disabled={job.applied}
                className={`w-full py-2.5 rounded-lg font-bold transition-colors ${
                  job.applied 
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                    : "bg-[#346b41] hover:bg-[#285232] text-white shadow-sm"
                }`}
              >
                {job.applied ? "Application Submitted" : "Apply Now"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}