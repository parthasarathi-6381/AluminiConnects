import React, { useEffect, useState } from "react";
import api from "../utils/api";
import UsersTable from "./UsersTable";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Load all users
  async function loadUsers() {
    const res = await api.get("/api/admin/users");
    console.log("API RESPONSE:", res.data);
    setUsers(res.data);
  }

  // Search users
  async function searchUsers() {
    if (!query.trim()) return loadUsers();
    const res = await api.get(`/api/admin/users/search?q=${query}`);
    setUsers(res.data);
  }

  // Filter users
  async function filterUsers(role) {
    setRoleFilter(role);
    if (!role) return loadUsers();
    const res = await api.get(`/api/admin/users/filter/${role}`);
    setUsers(res.data);
  }

  // Promote role
  async function promote(uid, newRole) {
    const res = await api.put("/api/admin/users/role", { uid, newRole });
    alert(res.data.message);
    loadUsers();
  }

  // Verify Alumni
  async function verifyAlumni(uid) {
    const res = await api.put("/api/admin/users/verify", { uid });
    alert(res.data.message);
    loadUsers();
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="admin-container">
      <Sidebar />
      <div className="main-content">
        <TopBar />

        <div className="search-section">
          <input
            type="text"
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={searchUsers}>Search</button>
        </div>

        <div className="filter-section">
          <select
            value={roleFilter}
            onChange={(e) => filterUsers(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="clubMember">Club Member</option>
            <option value="alumni">Alumni</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <UsersTable users={users} promote={promote} verifyAlumni={verifyAlumni} />
      </div>
    </div>
  );
}
