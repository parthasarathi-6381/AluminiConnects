import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>

      <ul>
        <li onClick={() => navigate("/admin")}>Dashboard</li>
        <li onClick={() => navigate("/admin/create-event")}>Create Event</li>
        <li onClick={() => navigate("/admin/jobs")}>Create Job / Internship</li>
        <li onClick={() => navigate("/admin/achievements")}>Manage Achievements</li>

        <li className="section-title">Manage Users</li>
        <li onClick={() => navigate("/admin/students")}>Students</li>
        <li onClick={() => navigate("/admin/alumni")}>Alumni</li>

        <li className="logout" onClick={() => navigate("/login")}>Logout</li>
      </ul>
    </div>
  );
}
