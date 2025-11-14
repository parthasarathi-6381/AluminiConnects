import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./AdminDashboardHome.css";

export default function AdminDashboardHome() {
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({
    students: 0,
    alumni: 0,
    events: 0,
    jobs: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const [pRes, cRes] = await Promise.all([
          api.get("/api/admin/profile"),
          api.get("/api/admin/counts"),
        ]);
        setProfile(pRes.data);
        setCounts(cRes.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    }
    load();
  }, []);

  return (
    <div className="dashboard-home">
      <div className="profile-card">
        <h3>Admin Dashboard</h3>
        <p><strong>Name:</strong> {profile?.name || ""}</p>
        <p><strong>Email:</strong> {profile?.email || ""}</p>
        <p><strong>Role:</strong> {profile?.role || ""}</p>
        <p><strong>Department:</strong> {profile?.department || ""}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h4>Students</h4>
          <p className="stat-number">{counts.students}</p>
        </div>
        <div className="stat-card">
          <h4>Alumni</h4>
          <p className="stat-number">{counts.alumni}</p>
        </div>
        <div className="stat-card">
          <h4>Events</h4>
          <p className="stat-number">{counts.events}</p>
        </div>
        <div className="stat-card">
          <h4>Jobs</h4>
          <p className="stat-number">{counts.jobs}</p>
        </div>
      </div>
    </div>
  );
}
