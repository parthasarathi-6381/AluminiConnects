import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css";
import { useLocation } from "react-router-dom";


export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="sidebar">
      <h2 className="side-title">Admin Panel</h2>

      <ul>
        <li onClick={() => navigate("/admin")}>Dashboard</li>
        <li onClick={() => navigate("/admin/create-event")}>Create Event</li>
        <li onClick={() => navigate("/admin/jobs")}>Create Job / Internship</li>
        <li onClick={() => navigate("/admin/achievements")}>Manage Achievements</li>

<p className="section-title">Manage Users</p>

<li
  className={location.pathname === "/admin/students" ? "active" : ""}
  onClick={() => navigate("/admin/students")}
>
  Students
</li>

<li
  className={location.pathname === "/admin/alumni" ? "active" : ""}
  onClick={() => navigate("/admin/alumni")}
>
  Alumni
</li>

<li
  className={location.pathname === "/login" ? "active logout" : "logout"}
  onClick={() => navigate("/login")}
>
  Logout
</li>

      </ul>
    </div>
  );
}
