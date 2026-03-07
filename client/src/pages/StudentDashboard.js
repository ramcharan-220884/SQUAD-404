import React, { useEffect, useState } from "react";
import { getAppliedJobs } from "../services/studentService";

export default function StudentDashboard() {
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const data = await getAppliedJobs();
        setAppliedJobs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAppliedJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Applied Jobs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {appliedJobs.map((job) => (
            <div key={job.id} className="bg-white p-4 rounded shadow">
              <h3 className="font-bold text-lg">{job.title}</h3>
              <p>Company: {job.company}</p>
              <p>Status: 
                <span className={`font-semibold ${
                  job.status === "Selected" ? "text-green-600" : job.status === "Shortlisted" ? "text-yellow-500" : "text-gray-600"
                }`}> {job.status}</span>
              </p>
              <p>CTC: {job.ctc}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Upcoming Drives</h2>
        <ul className="list-disc pl-5">
          {appliedJobs.filter(job => job.upcoming).map((job) => (
            <li key={job.id}>{job.company} — {job.title} on {job.drive_date}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}