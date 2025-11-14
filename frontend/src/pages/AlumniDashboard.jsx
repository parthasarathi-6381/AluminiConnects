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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Fetch all jobs (UNCHANGED)
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

  // 🔹 Post new job (UNCHANGED)
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

      setSuccessMsg("Job posted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      fetchJobs();
    } catch (err) {
      console.error("Error posting job:", err);
    }
  };

  // 🔹 Delete job (UNCHANGED)
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

      setSuccessMsg("Job deleted successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);

      fetchJobs(); // Refresh after delete
    } catch (err) {
      console.error("Error deleting job:", err);
    }
  };

  const handleLogout = async () => {
    const auth = getAuth();
    await signOut(auth);
    window.location.href = "/login";
  };

  return (
    <div className="d-flex vh-100 position-relative overflow-hidden" style={{ background: "linear-gradient(135deg,#0d0f23 0%, #1a1f3c 40%, #2c0f49 100%)" }}>
      {/* Animated background blobs (same feel as login) */}
      <div className="bg-shape1"></div>
      <div className="bg-shape2"></div>

      {/* SIDEBAR */}
      <aside
        className="d-flex flex-column p-4 text-white"
        style={{
          width: 260,
          zIndex: 20,
          background: "rgba(255,255,255,0.04)",
          backdropFilter: "blur(12px)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div>
          <h3 className="mb-4 text-center fw-bold">Alumni Panel</h3>

          <div className="d-grid gap-2 mb-2">
            <button
              className={`btn ${activeTab === "profile" ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => setActiveTab("profile")}
            >
              Profile
            </button>

            <button
              className={`btn ${activeTab === "jobs" ? "btn-primary" : "btn-outline-light"}`}
              onClick={() => setActiveTab("jobs")}
            >
              Jobs
            </button>
          </div>
        </div>

        {/* Logout pinned to bottom (mt-auto) */}
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="btn btn-danger w-100"
            style={{ borderRadius: 10 }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow-1 p-4 overflow-auto" style={{ zIndex: 10 }}>
        {successMsg && (
          <div className="alert alert-success text-center mx-auto" style={{ maxWidth: 800 }}>
            {successMsg}
          </div>
        )}

        {/* PROFILE PANEL */}
        {activeTab === "profile" && (
          <section className="mx-auto" style={{ maxWidth: 900 }}>
            <div
              className="p-5 mb-4"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              <h2 className="fw-bold mb-3">My Profile</h2>
              <div className="mb-2"><strong>Name:</strong> <span className="text-info">{profile?.name}</span></div>
              <div className="mb-2"><strong>Email:</strong> {profile?.email}</div>
              <div className="mb-2"><strong>Batch:</strong> {profile?.graduationYear - 4}-{profile?.graduationYear}</div>
              <div className="mb-2"><strong>Department:</strong> {profile?.department}</div>
            </div>
          </section>
        )}

        {/* JOBS PANEL */}
        {activeTab === "jobs" && (
          <section>
            <h2 className="fw-bold mb-3 text-white">Job Portal</h2>

            {/* Post Job - UI only (functions unchanged) */}
            <div
              className="p-4 mb-4"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(12px)",
                maxWidth: 1000,
              }}
            >
              <div className="card-body p-0">
                <form onSubmit={handleJobPost}>
                  <div className="row g-3">

                    <div className="col-md-6">
                      <label className="form-label text-white">Company</label>
                      <input
                        className="form-control bg-dark text-white border-0"
                        placeholder="Enter company name"
                        value={newJob.company}
                        onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                        required
                        style={{ height: 44 }}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label text-white">Role</label>
                      <input
                        className="form-control bg-dark text-white border-0"
                        placeholder="Enter role title"
                        value={newJob.role}
                        onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                        required
                        style={{ height: 44 }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-white">Duration</label>
                      <input
                        className="form-control bg-dark text-white border-0"
                        placeholder="e.g. 6 months"
                        value={newJob.duration}
                        onChange={(e) => setNewJob({ ...newJob, duration: e.target.value })}
                        required
                        style={{ height: 44 }}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label text-white">Stipend</label>
                      <input
                        className="form-control bg-dark text-white border-0"
                        placeholder="e.g. Rs.10000"
                        value={newJob.stipend}
                        onChange={(e) => setNewJob({ ...newJob, stipend: e.target.value })}
                        required
                        style={{ height: 44 }}
                      />
                    </div>

                    {/* MODE dropdown — exact values preserved */}
                    <div className="col-md-4">
                      <label className="form-label text-white">Mode</label>
                      <select
                        className="form-select bg-dark text-white border-0"
                        value={newJob.mode}
                        onChange={(e) => setNewJob({ ...newJob, mode: e.target.value })}
                        required
                        style={{ height: 44 }}
                      >
                        <option value="" disabled>-- Select Job Mode --</option>
                        <option value="Online">Online</option>
                        <option value="Offline">Offline</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div className="col-md-12">
                      <label className="form-label text-white">Application Link</label>
                      <input
                        className="form-control bg-dark text-white border-0"
                        placeholder="https://example.com/apply"
                        value={newJob.link}
                        onChange={(e) => setNewJob({ ...newJob, link: e.target.value })}
                        required
                        style={{ height: 44 }}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label text-white">Job Description</label>
                      <textarea
                        className="form-control bg-dark text-white border-0"
                        placeholder="Brief description about the job..."
                        rows="3"
                        value={newJob.description}
                        onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                        required
                        style={{ minHeight: 100 }}
                      />
                    </div>

                    <div className="col-md-12">
                      <label className="form-label text-white">Posted By</label>
                      <input
                        className="form-control bg-dark text-white border-0"
                        placeholder="Enter your name"
                        value={newJob.postedBy}
                        onChange={(e) => setNewJob({ ...newJob, postedBy: e.target.value })}
                        required
                        style={{ height: 44 }}
                      />
                    </div>

                    <div className="col-12 mt-2">
                      <button type="submit" className="btn btn-primary px-4">
                        Post Job
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

            {/* RECENT JOB POSTS — preserved */}
            <div
              className="p-3"
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.06)",
                maxWidth: 1000,
              }}
            >
              <h5 className="mb-3 text-white">Recent Job Posts</h5>

              <ul className="list-group list-group-flush">
                {jobs.length > 0 ? (
                  jobs.map((job, i) => (
                    <li key={i} className="list-group-item mb-3" style={{ background: "rgba(0,0,0,0.5)", borderRadius: 8 }}>
                      <h5 className="fw-bold text-info">{job.role}</h5>
                      <p className="mb-1"><strong>{job.company}</strong> — <span className="badge bg-info text-dark">{job.mode}</span> ({job.duration})</p>
                      <p className="text-muted small">{job.description}</p>
                      <p><strong>Stipend:</strong> {job.stipend}</p>

                      <a href={job.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">Apply Here</a>
                      <button className="btn btn-danger btn-sm ms-2" onClick={() => handleDelete(job._id)}>Delete</button>

                      <div className="mt-2"><small className="text-secondary">Posted by {job.postedBy} on {new Date(job.createdAt).toLocaleDateString()}</small></div>
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-center text-muted py-3">No jobs posted yet.</li>
                )}
              </ul>
            </div>
          </section>
        )}
      </main>

      {/* Local styles to match Login UI and ensure placeholders visible */}
      <style>{`
  /* floating background blobs */
  .bg-shape1, .bg-shape2 {
    position: absolute; width: 350px; height: 350px;
    border-radius: 50%; filter: blur(80px); z-index: 5;
  }
  .bg-shape1 { top: -80px; left: -60px; background: rgba(0,123,255,0.45); animation: float 6s ease-in-out infinite; }
  .bg-shape2 { bottom: -80px; right: -60px; background: rgba(255,0,150,0.45); animation: float 8s ease-in-out infinite; }
  @keyframes float {0%{transform:translateY(0);}50%{transform:translateY(25px);}100%{transform:translateY(0);} }

  /* 🌟 PLACEHOLDER FIX — LIGHT + CLEAR */
  ::placeholder {
    color: rgba(255,255,255,0.65) !important;
    opacity: 1 !important;
  }
  input, textarea, select {
    color: #fff !important;
  }

  /* 🌟 Profile & Job description text visible */
  .text-muted, .text-secondary, .list-group-item p {
    color: rgba(220,220,220,0.85) !important;
  }
  strong {
    color: #ffffff !important;
  }

  /* 🌟 Logout button at bottom without clash */
  aside {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  aside button {
    font-size: 15px;
    padding: 10px;
  }

  /* smooth input padding to match login UI */
  .form-control, .form-select {
    padding: 0.55rem 0.75rem;
    background: rgba(0,0,0,0.55) !important;
    border: 1px solid rgba(255,255,255,0.1) !important;
  }

  /* job list background */
  .list-group-item {
    background: rgba(0,0,0,0.45) !important;
    border-radius: 10px !important;
  }
    /* Make all profile labels (strong) light grey */
section strong {
  color: #d6d6d6 !important;
}

/* Make normal text inside profile light grey */
section div {
  color: #d6d6d6 !important;
}

/* Change blue text-info to purple tint */
.text-info {
  color: #b388ff !important;
}

`}</style>
    </div>
  );
}
