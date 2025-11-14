// src/pages/Signup.jsx
import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import GoogleAuthButton from "../components/GoogleAuthButton";

import {
  User,
  Mail,
  Lock,
  GraduationCap,
  Building2,
  Calendar,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    batch: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Create Firebase user
      const res = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = res.user;

      // Email verification
      await sendEmailVerification(user);

      // Token
      const token = await user.getIdToken();

      // Backend user data
      const backendData = {
        name: formData.name,
        department:
          formData.role === "admin"
            ? "Administration"
            : formData.department,
        graduationYear: formData.batch,
        role: formData.role,
      };

      const backendRes = await fetch(`${API_BASE}/api/users/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(backendData),
      });

      if (!backendRes.ok) {
        throw new Error("Failed to create user profile in backend");
      }

      alert(
        "Account created successfully! Verify your email before logging in."
      );
      navigate("/login");
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center position-relative overflow-hidden bg-dark">

      {/* 🔵 Animated Background Shapes */}
      <div className="bg-shape1"></div>
      <div className="bg-shape2"></div>

      <div className="container p-3" style={{ maxWidth: "1100px" }}>
        <div className="row g-4 align-items-center">

          {/* LEFT SIDE CONTENT */}
          <div className="col-lg-6 text-white">
            <h1 className="display-4 fw-bold mb-3">Join Our Community</h1>
            <p className="fs-5 mb-4 text-light">
              Connect with students, alumni & professionals worldwide.
            </p>

            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded-4 glass text-light">
                🌐 <strong>Wide Alumni Network</strong>
                <p className="mb-0">Engage with thousands of graduates.</p>
              </div>

              <div className="p-3 rounded-4 glass text-light">
                💼 <strong>Exclusive Opportunities</strong>
                <p className="mb-0">Internships, placements & mentorships.</p>
              </div>

              <div className="p-3 rounded-4 glass text-light">
                🎉 <strong>Events & Programs</strong>
                <p className="mb-0">Attend reunions, webinars & workshops.</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE SIGNUP FORM */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 p-4 rounded-4 glass">

              <h3 className="text-center mb-3 text-white fw-bold">
                Create Account
              </h3>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>

                {/* FULL NAME */}
                <div className="mb-3">
                  <label className="form-label text-white">Full Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-0">
                      <User size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-0"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* EMAIL */}
                <div className="mb-3">
                  <label className="form-label text-white">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-0">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-dark text-white border-0"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div className="mb-3">
                  <label className="form-label text-white">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-0">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-dark text-white border-0"
                      placeholder="Enter password"
                      minLength={6}
                      value={formData.password}
                      onChange={(e) =>
                        handleChange("password", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* ROLE */}
                <div className="mb-3">
                  <label className="form-label text-white">Role</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-0">
                      <GraduationCap size={18} />
                    </span>
                    <select
                      className="form-select bg-dark text-white border-0"
                      value={formData.role}
                      onChange={(e) => handleChange("role", e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="alumni">Alumni</option>
                      
                    </select>
                  </div>
                </div>

                {/* DEPARTMENT */}
                {formData.role !== "admin" && (
                  <div className="mb-3">
                    <label className="form-label text-white">Department</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-white border-0">
                        <Building2 size={18} />
                      </span>
                      <input
                        type="text"
                        className="form-control bg-dark text-white border-0"
                        placeholder="Enter department"
                        value={formData.department}
                        onChange={(e) =>
                          handleChange("department", e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                {/* GRADUATION YEAR */}
                {formData.role !== "admin" && (
                  <div className="mb-3">
                    <label className="form-label text-white">
                      Graduation Year
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark text-white border-0">
                        <Calendar size={18} />
                      </span>
                      <input
                        type="text"
                        maxLength="4"
                        className="form-control bg-dark text-white border-0"
                        placeholder="YYYY"
                        value={formData.batch}
                        onChange={(e) => handleChange("batch", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold fs-5 mt-2"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>
                <GoogleAuthButton />
              </form>

              <p className="text-center text-light mt-3">
                Already have an account?{" "}
                <a href="/login" className="text-warning fw-bold">
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SAME CSS USED IN LOGIN PAGE */}
      <style>{`
        .glass {
          background: rgba(255,255,255,0.1) !important;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
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
          color: rgba(230,230,230,0.55) !important;
        }
      `}</style>
    </div>
  );
}
