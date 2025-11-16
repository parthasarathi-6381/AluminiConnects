import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import GoogleAuthButton from "../components/GoogleAuthButton.jsx";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const user = res.user;

      if (!user.emailVerified) {
        setError("Please verify your email before logging in.");
        setLoading(false);
        return;
      }

      const token = await user.getIdToken();
      const profileRes = await fetch(`${API_BASE}/api/users/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const profileData = await profileRes.json();
      navigate("/home");
    } catch (err) {
      setError(err.message || "Login failed");
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

          {/* LEFT SIDE INFO */}
          <div className="col-lg-6 text-white">
            <h1 className="display-4 fw-bold mb-3">Welcome Back!</h1>
            <p className="fs-5 mb-4 text-light">
              Login to access exclusive alumni opportunities, events,
              and connect with thousands of professionals worldwide.
            </p>

            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded-4 glass text-light">
                🌐 <strong>Global Alumni Network</strong>  
                <p className="mb-0">Connect with alumni all over the world.</p>
              </div>

              <div className="p-3 rounded-4 glass text-light">
                💼 <strong>Job Recommendations</strong>
                <p className="mb-0">Get internship and placement opportunities.</p>
              </div>

              <div className="p-3 rounded-4 glass text-light">
                🎉 <strong>Campus & Alumni Events</strong>
                <p className="mb-0">Stay updated with reunions & workshops.</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE LOGIN CARD */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 p-4 rounded-4 glass">

              <h3 className="text-center mb-3 text-white fw-bold">Sign In</h3>

              {error && (
                <div className="alert alert-danger text-center">{error}</div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label text-white">Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-0">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-dark text-white border-0"
                      placeholder="Enter your mail id "
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label text-white">Password</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-0">
                      <Lock size={18} />
                    </span>
                    <input
                      type="password"
                      className="form-control bg-dark text-white border-0"
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold fs-5"
                  disabled={loading}
                >
                {loading ? "Processing..." : "Login"}
                
                </button>
                  <GoogleAuthButton />
              </form>

              {/* Signup link */}
              <p className="text-center mt-3 text-light">
                Don't have an account?{" "}
                <a href="/signup" className="text-warning fw-bold">
                  Sign Up
                </a>
              </p>

              <p className="text-center mt-2">
                <span
                  className="text-primary fw-bold"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </span>
              </p>


            </div>
          </div>
        </div>
      </div>

      {/* EXTRA CSS */}
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

  /* 🌫️ NEW: Light Grey + Transparent Placeholder */
  ::placeholder {
    color: rgba(217, 217, 217, 0.55) !important;
    font-weight: 400;
  }

  .form-control.bg-dark::placeholder {
    color: rgba(230, 230, 230, 0.55) !important;
  }

  /* 🔥 Reduce spacing between icon and input text */
  .input-group .form-control {
    padding-left: 0.4rem !important;
  }

  .input-group-text {
    padding-left: 0.3rem !important;
    padding-right: 0.3rem !important;
  }

`}</style>
    </div>
  );
}
