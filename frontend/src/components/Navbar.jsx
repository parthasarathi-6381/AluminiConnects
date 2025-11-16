import React from "react";
import "./Navbar.css";
import { useAuth } from "./AuthProvider";
import { Link, useNavigate } from "react-router-dom";

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
        <Link to="/home">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/jobs">Jobs</Link>
        <Link to="/discussions">Discussion</Link>
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
