import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Mail, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent! Check your email.");
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center position-relative overflow-hidden bg-dark">

      {/* 🔵 SAME ANIMATED BACKGROUND SHAPES AS LOGIN */}
      <div className="bg-shape1"></div>
      <div className="bg-shape2"></div>

      <div className="container p-3" style={{ maxWidth: "1100px" }}>
        <div className="row g-4 align-items-center">

          {/* LEFT SIDE INFO (same style as login) */}
          <div className="col-lg-6 text-white">
            <h1 className="display-4 fw-bold mb-3">Forgot Password?</h1>
            <p className="fs-5 mb-4 text-light">
              No worries! Enter your registered email and we’ll send you a
              password reset link immediately.
            </p>

            <div className="d-flex flex-column gap-3">
              <div className="p-3 rounded-4 glass text-light">
                🔒 <strong>Secure Reset</strong>
                <p className="mb-0">We ensure your account stays protected.</p>
              </div>

              <div className="p-3 rounded-4 glass text-light">
                ✉️ <strong>Email Verification</strong>
                <p className="mb-0">Reset link sent directly to your inbox.</p>
              </div>

              <div className="p-3 rounded-4 glass text-light">
                ⚡ <strong>Fast & Reliable</strong>
                <p className="mb-0">Get access back into your account quickly.</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE RESET CARD */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 p-4 rounded-4 glass">

              <h3 className="text-center mb-3 text-white fw-bold">Reset Password</h3>

              {message && (
                <div className="alert alert-success text-center">{message}</div>
              )}
              {error && (
                <div className="alert alert-danger text-center">{error}</div>
              )}

              <form onSubmit={handleReset}>

                {/* Email */}
                <div className="mb-3">
                  <label className="form-label text-white">Registered Email</label>
                  <div className="input-group">
                    <span className="input-group-text bg-dark text-white border-0">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="form-control bg-dark text-white border-0"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Reset Button */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-bold fs-5"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>

              {/* Back to Login */}
              <p className="text-center mt-4 mb-0">
                <button
                  className="btn btn-outline-light w-100 fw-semibold d-flex align-items-center justify-content-center"
                  onClick={() => navigate("/login")}
                >
                  <ArrowLeft size={18} className="me-2" />
                  Back to Login
                </button>
              </p>

            </div>
          </div>
        </div>
      </div>

      {/* SAME EXTRA CSS FROM LOGIN PAGE */}
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
          color: rgba(217, 217, 217, 0.55) !important;
          font-weight: 400;
        }

        .form-control.bg-dark::placeholder {
          color: rgba(230, 230, 230, 0.55) !important;
        }

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
