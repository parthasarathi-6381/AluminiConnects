import React from "react";
import "./Navbar.css";
import { useAuth } from "./AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
export default function Navbar() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Navigate based on role
  const goToDashboard = () => {
    if (!profile) return;

    switch (profile.role) {
      case "admin":
        navigate("/admin");
        break;
      case "alumni":
        navigate("/alumni");
        break;
      case "student":
      case "clubMember":
        navigate("/student");
        break;
      default:
        navigate("/home");
    }
  };

  return (
    <nav className="navbar-white">
      {/* LEFT LINKS */}
      <div className="nav-left">
        <NavLink to="/home" className="nav-link">Home</NavLink>
        <NavLink to="/events" className="nav-link">Events</NavLink>
        <NavLink to="/messages" className="nav-link">Messages</NavLink>
        <NavLink to="/jobs" className="nav-link">Jobs</NavLink>
        <NavLink to="/discussions" className="nav-link">Discussions</NavLink>
      </div>

      {/* RIGHT SIDE PROFILE CIRCLE */}
      <div className="nav-right">

        {/* Profile Circle Clickable */}
        <div className="nav-profile-circle" onClick={goToDashboard}>
          {getInitials(profile?.name)}
        </div>
      </div>
    </nav>
  );
}
