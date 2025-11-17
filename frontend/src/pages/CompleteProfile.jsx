import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function CompleteProfile() {
  const [role, setRole] = useState("");                 // NEW FIELD
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error("User not logged in.");
    }

    const token = await user.getIdToken();

    // 1️⃣ Send details to backend
    const res = await fetch(`${API_BASE}/api/users/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        uid: user.uid,
        email: user.email,
        name: localStorage.getItem("tempName"),
        department,
        graduationYear,
      }),
    });

    if (!res.ok) throw new Error("Failed to save profile");

    // 2️⃣ ⭐ IMPORTANT FIX: Force Firebase to refresh token
    await user.getIdToken(true);   // 🔥 FIX THAT PREVENTS LOGOUT

    // Alternatively you can do:
    // import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
    // const credential = GoogleAuthProvider.credential(user.stsTokenManager.accessToken);
    // await signInWithCredential(auth, credential);

    // 3️⃣ Redirect AFTER the token refresh
    navigate("/home");
    return;
  } catch (err) {
    console.error(err);
    setError(err.message);
  }
};

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center position-relative overflow-hidden bg-dark">

      <div className="bg-shape1"></div>
      <div className="bg-shape2"></div>

      <div className="card shadow-lg border-0 p-4 rounded-4 glass" style={{ width: "420px" }}>
        <h2 className="text-center mb-3 text-white fw-bold">Complete Profile</h2>
        <p className="text-center text-light mb-4" style={{ fontSize: "14px" }}>
          Just a few more details to finish setting up your account.
        </p>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ROLE (NEW FIELD) */}
          <div className="mb-3">
            <label className="form-label text-white">Role</label>

           <select
              className="form-select bg-dark text-white border-0"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{
                height: "48px",
                paddingTop: "10px",
                paddingBottom: "10px",
              }}
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>

          </div>

          {/* Department (UPDATED) */}
          <div className="mb-3">
            <label className="form-label text-white">Department</label>

           <select
            className="form-select bg-dark text-white border-0"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            required
            style={{
              height: "48px",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          >
                    <option value="">Select Department</option>
                    <option value="EEE">EEE</option>
                    <option value="ECE">ECE</option>
                    <option value="MECH">MECH</option>
                    <option value="CSE">CSE</option>
                    <option value="CIVIL">CIVIL</option>
            </select>

          </div>

          {/* Graduation Year */}
          <div className="mb-3">
            <label className="form-label text-white">Graduation Year</label>
            <input
              type="text"
              maxLength={4}
              className="form-control bg-dark text-white border-0"
              placeholder="YYYY"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              required
              style={{ height: "42px" }}
            />
          </div>

          <button
            className="btn btn-primary w-100 mt-2 fw-bold"
            style={{
              height: "45px",
              fontSize: "16px",
              background: "linear-gradient(90deg, #6a11cb, #2575fc)",
              border: "none",
              borderRadius: "8px",
            }}
          >
            Submit
          </button>
        </form>
      </div>

      <style>{`
        .glass {
          background: rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.15);
        }

        .bg-shape1, .bg-shape2 {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          filter: blur(80px);
          z-index: 0;
        }

        .bg-shape1 {
          top: -80px;
          left: -60px;
          background: rgba(0,123,255,0.5);
          animation: float 6s ease-in-out infinite;
        }

        .bg-shape2 {
          bottom: -80px;
          right: -60px;
          background: rgba(255,0,150,0.5);
          animation: float 8s ease-in-out infinite;
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(25px); }
          100% { transform: translateY(0px); }
        }

        ::placeholder {
          color: rgba(217, 217, 217, 0.55) !important;
        }
      `}</style>
    </div>
  );
}
