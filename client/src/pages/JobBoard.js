import React, { useEffect, useState } from "react";
import { getJobs, applyJob } from "../services/jobService";

export default function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getJobs();
        setJobs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      await applyJob(jobId);
      setMessage("Applied successfully!");
      setJobs(jobs.map(job => job.id === jobId ? {...job, applied:true} : job));
    } catch (err) {
      setMessage("Error applying for job.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Job Board</h1>
      {message && <p className="text-green-500 mb-4">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg">{job.title}</h2>
            <p>Company: {job.company}</p>
            <p>CTC: {job.ctc}</p>
            <p>Min CGPA: {job.min_cgpa}</p>
            <p>Status: {job.applied ? "Applied" : "Not Applied"}</p>
            <button
              onClick={() => handleApply(job.id)}
              disabled={job.applied}
              className={`mt-2 w-full p-2 rounded text-white ${
                job.applied ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {job.applied ? "Already Applied" : "Apply"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}