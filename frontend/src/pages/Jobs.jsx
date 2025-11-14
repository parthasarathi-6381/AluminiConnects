import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Error fetching jobs");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center mt-5 text-light">Loading jobs...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container my-4 text-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold" style={{ color: "#c8a6ff" }}>Job Opportunities</h2>

        <button
          className="btn"
          style={{
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#d3b3ff",
            padding: "8px 18px",
          }}
          onClick={fetchJobs}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Job Cards */}
      {jobs.length === 0 ? (
        <div
          className="text-center p-4"
          style={{
            background: "rgba(0,0,0,0.35)",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            color: "#c8c8c8",
          }}
        >
          No jobs posted yet!
        </div>
      ) : (
        <div className="row">
          {jobs.map((job) => (
            <div key={job._id} className="col-md-4 mb-4">
              <div
                className="p-4 h-100"
                style={{
                  background: "rgba(0,0,0,0.38)",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  backdropFilter: "blur(14px)",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.5)",
                  color: "#dcdcdc",
                }}
              >
                <h5
                  className="fw-bold mb-3"
                  style={{ color: "#b180ff" }}
                >
                  {job.title}
                </h5>

                <p style={{ fontSize: "14px", lineHeight: "1.55" }}>
                  <strong style={{ color: "#bfa8ff" }}>Company:</strong> {job.company || "N/A"}
                  <br />
                  <strong style={{ color: "#bfa8ff" }}>Role:</strong> {job.role || "Not specified"}
                  <br />
                  <strong style={{ color: "#bfa8ff" }}>Posted by:</strong> {job.postedBy || "Anonymous"}
                  <br />
                  <strong style={{ color: "#bfa8ff" }}>Stipend:</strong> {job.stipend || "No Stipend"}
                  <br />
                  <strong style={{ color: "#bfa8ff" }}>Mode:</strong> {job.mode || "Not specified"}
                </p>

                {/* Description */}
                <p
                  className="mt-3"
                  style={{
                    fontSize: "13px",
                    color: "#e0d4ff",
                  }}
                >
                  <strong style={{ color: "#cba7ff" }}>Description:</strong>{" "}
                  {job.description?.length > 100
                    ? job.description.substring(0, 100) + "..."
                    : job.description}
                </p>

                {/* Apply Button */}
                <a
                  href={job.link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn w-100 mt-3"
                  style={{
                    background: "linear-gradient(90deg, #5a0ecb 0%, #7c3aff 100%)",
                    color: "white",
                    borderRadius: "10px",
                    padding: "10px",
                    fontWeight: "bold",
                  }}
                >
                  Apply Now
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
