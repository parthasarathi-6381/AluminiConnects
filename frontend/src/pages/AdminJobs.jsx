import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import "./AdminJobs.css";

export default function AdminJobs() {
  const [jobs, setJobs] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  const [newJob, setNewJob] = useState({
    company: "",
    role: "",
    duration: "",
    stipend: "",
    mode: "",
    link: "",
    description: "",
    postedBy: "Admin",
  });

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch("http://localhost:5000/api/jobs/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error fetching jobs");

      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // Create job
  const handleJobPost = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newJob),
      });

      if (!res.ok) throw new Error("Failed to post job");

      setSuccessMsg("Job posted successfully!");
      setTimeout(() => setSuccessMsg(""), 2500);

      setNewJob({
        company: "",
        role: "",
        duration: "",
        stipend: "",
        mode: "",
        link: "",
        description: "",
        postedBy: "Admin",
      });

      fetchJobs();
    } catch (err) {
      console.error("Error posting job:", err);
    }
  };

  // Delete job
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error deleting job");

      setSuccessMsg("Job deleted!");
      setTimeout(() => setSuccessMsg(""), 2000);

      fetchJobs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="jobs-wrapper">
      <div className="jobs-container">
        <h2 className="page-title">Manage Jobs</h2>

        {successMsg && <div className="alert-success">{successMsg}</div>}

        {/* Create Job */}
        <div className="job-form-box">
          <h3>Create New Job</h3>

          <form onSubmit={handleJobPost}>
            <div className="grid-2">
              <input
                placeholder="Company"
                value={newJob.company}
                onChange={(e) =>
                  setNewJob({ ...newJob, company: e.target.value })
                }
                required
              />

              <input
                placeholder="Role"
                value={newJob.role}
                onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                required
              />
            </div>

            <div className="grid-3">
              <input
                placeholder="Duration"
                value={newJob.duration}
                onChange={(e) =>
                  setNewJob({ ...newJob, duration: e.target.value })
                }
                required
              />

              <input
                placeholder="Stipend"
                value={newJob.stipend}
                onChange={(e) =>
                  setNewJob({ ...newJob, stipend: e.target.value })
                }
                required
              />

              <select
                value={newJob.mode}
                onChange={(e) =>
                  setNewJob({ ...newJob, mode: e.target.value })
                }
                required
              >
                <option value="">Select Mode</option>
                <option>Online</option>
                <option>Offline</option>
                <option>Hybrid</option>
              </select>
            </div>

            <input
              placeholder="Application Link"
              value={newJob.link}
              onChange={(e) =>
                setNewJob({ ...newJob, link: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Job Description"
              rows="3"
              value={newJob.description}
              onChange={(e) =>
                setNewJob({ ...newJob, description: e.target.value })
              }
              required
            />

            <button className="btn-create">Create Job</button>
          </form>
        </div>

        {/* JOB LIST */}
        <h3 className="sub-title">All Jobs</h3>

        {jobs.length === 0 ? (
          <p className="no-jobs">No jobs available</p>
        ) : (
          <ul className="job-list">
            {jobs.map((job) => (
              <li key={job._id} className="job-card">
                <div>
                  <strong>{job.role}</strong> @ {job.company}
                  <p>Mode: {job.mode} | Stipend: {job.stipend}</p>
                </div>

                <button
                  className="btn-delete"
                  onClick={() => handleDelete(job._id)}
                >
                  ✖
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
