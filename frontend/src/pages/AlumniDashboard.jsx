import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { getAuth } from "firebase/auth";

export default function AlumniDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
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
    postedBy: "",
  });

  const { profile } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  // 🔹 Fetch all jobs
  const fetchJobs = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch("http://localhost:5000/api/jobs/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  // 🔹 Post new job
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

      setNewJob({
        company: "",
        role: "",
        duration: "",
        stipend: "",
        mode: "",
        link: "",
        description: "",
        postedBy: "",
      });

      setSuccessMsg("🎉 Job posted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      fetchJobs();
    } catch (err) {
      console.error("Error posting job:", err);
    }
  };

  // 🔹 Delete job
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete job");

      setSuccessMsg("🗑️ Job deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      fetchJobs(); // Refresh after delete
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      {/* Sidebar */}
      <div className="bg-dark text-white p-4" style={{ width: "250px" }}>
        <h3 className="mb-4 text-center">🎓 Alumni Panel</h3>
        <ul className="nav flex-column">
          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start ${
                activeTab === "profile" ? "btn-primary" : "btn-outline-light"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              👤 Profile
            </button>
          </li>
          <li className="nav-item mb-2">
            <button
              className={`btn w-100 text-start ${
                activeTab === "jobs" ? "btn-primary" : "btn-outline-light"
              }`}
              onClick={() => setActiveTab("jobs")}
            >
              💼 Jobs
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 overflow-auto">
        {activeTab === "profile" && (
          <div>
            <h3 className="fw-bold mb-4 text-primary">👤 My Profile</h3>
            <div className="card shadow p-4 border-0">
              <h5>
                Name: <span className="text-primary">{profile?.name}</span>
              </h5>
              <h6>Email: {profile?.email}</h6>
              <h6>
                Batch: {profile.graduationYear - 4}-{profile.graduationYear}
              </h6>
              <h6>Department: {profile.department}</h6>
            </div>
          </div>
        )}

        {activeTab === "jobs" && (
          <div>
            <h3 className="fw-bold mb-4 text-primary">💼 Job Portal</h3>

            {/* Success Message */}
            {successMsg && (
              <div className="alert alert-success py-2">{successMsg}</div>
            )}

            {/* Post Job */}
            <div className="card shadow mb-4 border-0">
              <div className="card-header bg-primary text-white fw-bold fs-5">
                Post a Job
              </div>
              <div className="card-body">
                <form onSubmit={handleJobPost} className="p-2">
                  <div className="row g-3">
                    {/* All job form inputs exactly same as your original */}
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Company</label>
                      <input
                        className="form-control"
                        placeholder="Enter company name"
                        value={newJob.company}
                        onChange={(e) =>
                          setNewJob({ ...newJob, company: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Role</label>
                      <input
                        className="form-control"
                        placeholder="Enter role title"
                        value={newJob.role}
                        onChange={(e) =>
                          setNewJob({ ...newJob, role: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Duration</label>
                      <input
                        className="form-control"
                        placeholder="e.g. 6 months"
                        value={newJob.duration}
                        onChange={(e) =>
                          setNewJob({ ...newJob, duration: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Stipend</label>
                      <input
                        className="form-control"
                        placeholder="e.g. Rs.10000"
                        value={newJob.stipend}
                        onChange={(e) =>
                          setNewJob({ ...newJob, stipend: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Mode</label>
                      <select
                        className="form-select border-primary fw-semibold text-dark"
                        style={{ backgroundColor: "#e9f5ff" }}
                        value={newJob.mode}
                        onChange={(e) =>
                          setNewJob({ ...newJob, mode: e.target.value })
                        }
                        required
                      >
                        <option value="" disabled>
                          -- Select Job Mode --
                        </option>
                        <option value="Online">🖥️ Online</option>
                        <option value="Offline">🏢 Offline</option>
                        <option value="Hybrid">🌐 Hybrid</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold">
                        Application Link
                      </label>
                      <input
                        className="form-control"
                        placeholder="https://example.com/apply"
                        value={newJob.link}
                        onChange={(e) =>
                          setNewJob({ ...newJob, link: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold">
                        Job Description
                      </label>
                      <textarea
                        className="form-control"
                        placeholder="Brief description about the job..."
                        rows="3"
                        value={newJob.description}
                        onChange={(e) =>
                          setNewJob({ ...newJob, description: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Posted By</label>
                      <input
                        className="form-control"
                        placeholder="Enter your name"
                        value={newJob.postedBy}
                        onChange={(e) =>
                          setNewJob({ ...newJob, postedBy: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success mt-4 px-4">
                    🚀 Post Job
                  </button>
                </form>
              </div>
            </div>

            {/* Job List */}
            <div className="card shadow border-0">
              <div className="card-header bg-dark text-white fw-bold fs-5">
                Recent Job Posts
              </div>
              <ul className="list-group list-group-flush">
                {jobs.length > 0 ? (
                  jobs.map((job, i) => (
                    <li key={i} className="list-group-item py-3">
                      <h5 className="fw-bold text-primary">{job.role}</h5>
                      <p className="mb-1">
                        <strong>{job.company}</strong> —{" "}
                        <span className="badge bg-info text-dark">
                          {job.mode}
                        </span>{" "}
                        ({job.duration})
                      </p>

                      <p className="text-muted small">{job.description}</p>
                      <p>
                        💰 <strong>{job.stipend}</strong>
                      </p>

                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary btn-sm"
                      >
                        🔗 Apply Here
                      </a>

                      {/* 🔹 DELETE BUTTON */}
                      <button
                        className="btn btn-danger btn-sm ms-2"
                        onClick={() => handleDelete(job._id)}
                      >
                        🗑️ Delete
                      </button>

                      <br />
                      <small className="text-secondary">
                        Posted by {job.postedBy} on{" "}
                        {new Date(job.createdAt).toLocaleDateString()}
                      </small>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-center text-muted py-3">
                    No jobs posted yet.
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
