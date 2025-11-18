// src/pages/AlumniDashboard.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { getAuth, signOut } from "firebase/auth";

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

  const fetchJobs = async () => {
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:5000/api/jobs/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch jobs");
      setJobs(await res.json());
    } catch (err) {
      console.error("Error fetching jobs:", err);
    }
  };

  const handleJobPost = async (e) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch("http://localhost:5000/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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

      setSuccessMsg("Job posted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchJobs();
    } catch (err) {
      console.error("Error posting job:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      await fetch(`http://localhost:5000/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuccessMsg("Job deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchJobs();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div
      className="d-flex vh-100 position-relative overflow-hidden"
      style={{ background: "linear-gradient(135deg,#0d0f23,#2c0f49)" }}
    >
      {/* ---- ❗ SIDEBAR ---- */}
      <aside
        className="p-4 text-white d-flex flex-column"
        style={{
          width: 260,
          background: "rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(10px)",
        }}
      >
        <h3 className="fw-bold text-center mb-4">Alumni Panel</h3>

        <button
          className={`btn mb-2 ${activeTab === "profile" ? "btn-primary" : "btn-outline-light"}`}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>

        <button
          className={`btn mb-2 ${activeTab === "jobs" ? "btn-primary" : "btn-outline-light"}`}
          onClick={() => setActiveTab("jobs")}
        >
          Jobs
        </button>

        <button onClick={handleLogout} className="btn btn-danger mt-auto">
          Logout
        </button>
      </aside>

      {/* ---- ❗ MAIN CONTENT ---- */}
      <main className="flex-grow-1 p-4 overflow-auto">

        {successMsg && (
          <div className="alert alert-success text-center mx-auto" style={{ maxWidth: 700 }}>
            {successMsg}
          </div>
        )}

        {/* ---- PROFILE TAB ---- */}
        {activeTab === "profile" && (
          <div className="d-flex justify-content-center align-items-center h-100">
            <div className="profile-card p-5">
              <h2 className="fw-bold text-gradient mb-4 text-center">My Profile</h2>

              <div className="avatar-circle mb-3">
  {profile?.name ? profile?.name[0].toUpperCase() : "?"}
</div>

<div className="profile-details">
  <div className="detail-row">
    <span className="label">Name:</span>
    <span className="value">{profile?.name}</span>
  </div>

  <div className="detail-row">
    <span className="label">Email:</span>
    <span className="value">{profile?.email}</span>
  </div>

  <div className="detail-row">
    <span className="label">Batch:</span>
    <span className="value">
      {profile?.graduationYear - 4}-{profile?.graduationYear}
    </span>
  </div>

  <div className="detail-row">
    <span className="label">Department:</span>
    <span className="value">{profile?.department}</span>
  </div>
</div>

            </div>
          </div>
        )}

        {/* ---- JOBS TAB ---- */}
        {activeTab === "jobs" && (
          <div className="d-flex flex-column align-items-center w-100">

            <h2 className="fw-bold text-white text-center mb-4">Job Portal</h2>

            {/* POST JOB BOX */}
            <div className="job-box p-4 mb-4">
              <form onSubmit={handleJobPost}>
                <div className="row g-3">

                  {/** ALL INPUTS UNCHANGED **/}

                  {/* ✅ COMPANY / ROLE / DURATION / STIPEND */}
                  <div className="row g-3">

  {/* 🔹 COMPANY */}
  <div className="col-md-6">
    <label className="text-white">Company</label>
    <input
      className="form-control input-dark"
      placeholder="e.g., Google"
      value={newJob.company}
      onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
      required
    />
  </div>

  {/* 🔹 ROLE */}
  <div className="col-md-6">
    <label className="text-white">Job Role</label>
    <input
      className="form-control input-dark"
      placeholder="e.g., Software Intern"
      value={newJob.role}
      onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
      required
    />
  </div>

  {/* 🔹 DURATION */}
  <div className="col-md-6">
    <label className="text-white">Duration</label>
    <input
      className="form-control input-dark"
      placeholder="e.g., 6 Months"
      value={newJob.duration}
      onChange={(e) => setNewJob({ ...newJob, duration: e.target.value })}
      required
    />
  </div>

  {/* 🔹 STIPEND */}
  <div className="col-md-6">
    <label className="text-white">Stipend</label>
    <input
      className="form-control input-dark"
      placeholder="e.g., ₹25,000/month or Unpaid"
      value={newJob.stipend}
      onChange={(e) => setNewJob({ ...newJob, stipend: e.target.value })}
      required
    />
  </div>

  {/* 🔹 MODE DROPDOWN */}
  <div className="col-md-6">
    <label className="text-white">Job Mode</label>
    <select
      className="form-control input-dark"
      value={newJob.mode}
      onChange={(e) => setNewJob({ ...newJob, mode: e.target.value })}
      required
    >
      <option value="">Select Mode</option>
      <option value="Remote">Remote</option>
      <option value="Hybrid">Hybrid</option>
      <option value="On-site">On-site</option>
    </select>
  </div>

  {/* 🔹 APPLICATION LINK */}
  <div className="col-md-6">
    <label className="text-white">Application Link</label>
    <input
      className="form-control input-dark"
      placeholder="Paste application URL"
      value={newJob.link}
      onChange={(e) => setNewJob({ ...newJob, link: e.target.value })}
      required
    />
  </div>

  {/* 🔹 POSTED BY */}
  <div className="col-md-12">
    <label className="text-white">Posted By</label>
    <input
      className="form-control input-dark"
      placeholder="Your Name"
      value={newJob.postedBy}
      onChange={(e) => setNewJob({ ...newJob, postedBy: e.target.value })}
      required
    />
  </div>

  {/* 🔹 JOB DESCRIPTION */}
  <div className="col-12">
    <label className="text-white">Job Description</label>
    <textarea
      className="form-control input-dark"
      placeholder="Short description about the job role..."
      rows="3"
      value={newJob.description}
      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
      required
    />
  </div>

  <button type="submit" className="btn btn-primary mt-2 w-100">
    Post Job
  </button>
</div>

                </div>
              </form>
            </div>

            {/* ---- JOB LIST ---- */}
            <div className="job-list p-3">
              <h4 className="text-white">Recent Jobs</h4>

              {jobs.length === 0 ? (
                <p className="text-muted text-center mt-3">No jobs posted yet.</p>
              ) : (
                <ul className="list-group list-group-flush">
                  {jobs.map((job) => (
                    <li className="list-group-item job-item" key={job._id}>
                      <h5 className="fw-bold text-info">{job.role}</h5>
                      <small className="text-secondary">{job.company}</small>
                      <br />
                      <button className="btn btn-danger btn-sm mt-2" onClick={() => handleDelete(job._id)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ---- GLOBAL STYLES ---- */}
      <style>{`
        .profile-card {
          width: 450px;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
          color: white;
        }

        .profile-line { font-size: 1.15rem; margin-bottom: 8px; }

        .job-box, .job-list {
          width: 100%;
  max-width: 550px;   /* SAME WIDTH AS PROFILE CARD */
  margin: 0 auto;
          border-radius: 14px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          backdrop-filter: blur(12px);
          color: white;
        }

        .input-dark {
          background: rgba(0,0,0,0.55) !important;
          border: 1px solid rgba(255,255,255,0.2) !important;
          color: white !important;
        }

        .job-item {
          background: rgba(0,0,0,0.45) !important;
          border-radius: 8px !important;
          margin-top: 10px;
        }

        .text-gradient {
          background: linear-gradient(90deg, #b388ff, #ff6bff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
          ::placeholder {
  color: rgba(255, 255, 255, 0.75) !important;   /* Brighter */
  opacity: 1 !important;
}
  .avatar-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b388ff, #ff6bff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  font-weight: bold;
  color: white;
  margin: 0 auto 15px auto;
}

.profile-details {
  width: 100%;
  margin-top: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 700 !important;   /* FULL BOLD */
  opacity: 1 !important;         /* FULL VISIBILITY */
  letter-spacing: 0.3px;         /* (optional) makes it cleaner */
}

.value {
  font-weight: 500;
  text-align: right;
}


      `}</style>
    </div>
  );
}
