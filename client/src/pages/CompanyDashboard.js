import React, { useEffect, useState } from "react";
import { getPostedJobs, postJob, updateApplicationStatus } from "../services/companyService";

export default function CompanyDashboard() {
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    min_cgpa: "",
    ctc: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getPostedJobs();
        setJobs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  const handleChange = (e) => {
    setNewJob({ ...newJob, [e.target.name]: e.target.value });
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await postJob(newJob);
      setMessage("Job posted successfully!");
      setJobs([...jobs, newJob]); // Simple update
      setNewJob({ title: "", min_cgpa: "", ctc: "" });
    } catch (err) {
      setMessage("Error posting job");
    }
  };

  const handleStatusUpdate = async (jobId, studentId, status) => {
    try {
      await updateApplicationStatus(jobId, studentId, status);
      setMessage("Status updated successfully!");
    } catch (err) {
      setMessage("Error updating status");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Company Dashboard</h1>

      {message && <p className="text-green-500 mb-4">{message}</p>}

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Post a Job</h2>
        <form
          onSubmit={handlePostJob}
          className="bg-white p-4 rounded shadow grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <input
            type="text"
            name="title"
            placeholder="Job Title"
            value={newJob.title}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="number"
            name="min_cgpa"
            placeholder="Min CGPA"
            value={newJob.min_cgpa}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="ctc"
            placeholder="CTC"
            value={newJob.ctc}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="col-span-1 md:col-span-3 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Post Job
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Posted Jobs</h2>
        {jobs.map((job) => (
          <div key={job.id} className="bg-white p-4 rounded shadow mb-4">
            <h3 className="font-bold">{job.title}</h3>
            <p>Min CGPA: {job.min_cgpa}</p>
            <p>CTC: {job.ctc}</p>

            {/* Example: Student applications list */}
            {job.applications?.map((app) => (
              <div key={app.student_id} className="flex justify-between mt-2">
                <span>{app.student_name}</span>
                <select
                  value={app.status}
                  onChange={(e) =>
                    handleStatusUpdate(job.id, app.student_id, e.target.value)
                  }
                  className="border rounded p-1"
                >
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            ))}
          </div>
        ))}
      </section>
    </div>
  );
}