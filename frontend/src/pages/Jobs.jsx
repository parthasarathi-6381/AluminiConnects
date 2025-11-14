import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";

function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch jobs using native fetch()
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
    const interval = setInterval(fetchJobs, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center mt-5">Loading jobs...</div>;
  if (error) return <div className="text-danger text-center mt-5">{error}</div>;

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold">Job Opportunities</h2>
        <button className="btn btn-outline-primary" onClick={fetchJobs}>
          🔄 Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="alert alert-info text-center">No jobs posted yet!</div>
      ) : (
        <div className="row">
          {jobs.map((job) => (
            <div key={job._id} className="col-md-4 mb-4">
              <div className="card shadow-sm h-100 border-0">
                <div className="card-body">
                  <h5 className="card-title text-primary fw-bold">{job.title}</h5>
                  <p className="card-text">
                    <strong>Company:</strong> {job.company || "N/A"}
                    <br />
                    <strong>Role:</strong> {job.role|| "Not specified"}
                    <br />
                    <strong>Posted by:</strong> {job.postedBy || "Anonymous"}
                    <br />
                    <strong>Stipend:</strong> {job.stipend || "No Stipend"}
                    <br />
                    <strong>Mode:</strong> {job.mode || "Anonymous"}
                  </p>
                  <p className="card-text text-muted">
                     <strong>Description:</strong> 
                    {job.description?.length > 100
                      ? job.description.substring(0, 100) + "..."
                      : job.description}
                  </p>
                </div>
                <div className="card-footer bg-transparent border-top-0">
                  <a
                    href={job.link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary w-100"
                  >
                    Apply Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Jobs;
