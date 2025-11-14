// src/components/Navbar.jsx
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import "./Navbar.css";

export default function Navbar() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (!profile || !profile.role) {
      navigate("/login");
      return;
    }

    switch (profile.role.toLowerCase()) {
      case "student":
        navigate("/student");
        break;
      case "admin":
        navigate("/admin");
        break;
      case "alumni":
        navigate("/alumni");
        break;
      default:
        navigate("/login");
    }
  };

  return (
    <nav className="navbar ">
      <div className="nav-left">
        <NavLink to="/home" className="nav-link">Home</NavLink>
        <NavLink to="/events" className="nav-link">Events</NavLink>
        <NavLink to="/donations" className="nav-link">Donations</NavLink>
        <NavLink to="/jobs" className="nav-link">Jobs</NavLink>
        <NavLink to="/messages" className="nav-link">Messages</NavLink>
      </div>

      <div className="nav-right">
        <button onClick={handleProfileClick} className="profile-btn">
          <img
            src={
              profile?.photoURL ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="Profile"
            className="profile-image"
          />
        </button>
      </div>
    </nav>
  );
}
