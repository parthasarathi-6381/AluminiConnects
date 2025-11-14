import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function CompleteProfile() {
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const uid = localStorage.getItem("tempUid");
    const token = localStorage.getItem("tempToken");
    const email = localStorage.getItem("tempEmail");
    const name = localStorage.getItem("tempName");

    try {
      const res = await fetch(`${API_BASE}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
          department,
          graduationYear,
        }),
      });

      if (!res.ok) throw new Error("Failed to save profile");

      // cleanup temp data
      localStorage.removeItem("tempUid");
      localStorage.removeItem("tempToken");
      localStorage.removeItem("tempEmail");
      localStorage.removeItem("tempName");

      alert("Profile completed! You can now access the dashboard.");
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5 text-white">
      <h2>Complete Your Profile</h2>
      <p>We need a few more details to finish setting up your account.</p>

      {error && <p className="text-danger">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Department</label>
        <input className="form-control mb-3"
          value={department}
          onChange={e => setDepartment(e.target.value)}
          required
        />

        <label>Graduation Year</label>
        <input className="form-control mb-3"
          value={graduationYear}
          maxLength={4}
          onChange={e => setGraduationYear(e.target.value)}
          required
        />

        <button className="btn btn-primary w-100">Submit</button>
      </form>
    </div>
  );
}
