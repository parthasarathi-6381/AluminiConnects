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
    <div className="manage-jobs-page" style={{ marginLeft: 230, padding: 20 }}>
      <h2>Manage Jobs</h2>

      {successMsg && (
        <div className="alert alert-success" style={{ maxWidth: 600 }}>
          {successMsg}
        </div>
      )}

      {/* Create Job */}
      <div
        className="p-4 mb-4"
        style={{
          background: "#f5f5f5",
          borderRadius: 10,
          maxWidth: 800,
        }}
      >
        <h4>Create New Job</h4>

        <form onSubmit={handleJobPost}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label>Company</label>
              <input
                className="form-control"
                value={newJob.company}
                onChange={(e) =>
                  setNewJob({ ...newJob, company: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label>Role</label>
              <input
                className="form-control"
                value={newJob.role}
                onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Duration</label>
              <input
                className="form-control"
                value={newJob.duration}
                onChange={(e) =>
                  setNewJob({ ...newJob, duration: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Stipend</label>
              <input
                className="form-control"
                value={newJob.stipend}
                onChange={(e) =>
                  setNewJob({ ...newJob, stipend: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-4 mb-3">
              <label>Mode</label>
              <select
                className="form-select"
                value={newJob.mode}
                onChange={(e) =>
                  setNewJob({ ...newJob, mode: e.target.value })
                }
                required
              >
                <option value="">Select mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className="col-md-12 mb-3">
              <label>Application Link</label>
              <input
                className="form-control"
                value={newJob.link}
                onChange={(e) =>
                  setNewJob({ ...newJob, link: e.target.value })
                }
                required
              />
            </div>

            <div className="col-md-12 mb-3">
              <label>Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={newJob.description}
                onChange={(e) =>
                  setNewJob({ ...newJob, description: e.target.value })
                }
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create Job
            </button>
          </div>
        </form>
      </div>

      {/* Jobs List */}
      <h4>All Jobs</h4>

      {jobs.length === 0 ? (
        <p>No jobs available</p>
      ) : (
        <ul className="list-group" style={{ maxWidth: 800 }}>
          {jobs.map((job) => (
            <li
              key={job._id}
              className="list-group-item d-flex justify-content-between"
            >
              <div>
                <strong>{job.role}</strong> at {job.company}
                <div>Mode: {job.mode}</div>
                <div>Stipend: {job.stipend}</div>
              </div>

              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(job._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
