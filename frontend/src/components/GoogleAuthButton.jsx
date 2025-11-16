import React from "react";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function GoogleAuthButton() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const uid = user.uid;
      const token = await user.getIdToken();

      // 🔍 1. Check if user exists in backend
      const existsRes = await fetch(`${API_BASE}/api/users/exists/${uid}`);
      const existsData = await existsRes.json();

      if (!existsData.exists) {
        // ⛔ First-time Google signup → redirect to complete profile
        localStorage.setItem("tempUid", uid);
        localStorage.setItem("tempToken", token);
        localStorage.setItem("tempEmail", user.email);
        localStorage.setItem("tempName", user.displayName);
        return navigate("/complete-profile");
      }

      // ✔ Existing user → go to home dashboard
      navigate("/home");

    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  return (
    <button className="btn btn-primary w-100 py-2 fw-bold fs-5" style={{
  marginTop: "12px"
}} onClick={handleGoogleLogin}>
      Continue with Google
    </button>
  );
}
