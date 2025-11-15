import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./ManageStudents.css";

export default function ManageStudents() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("students"); // "students" | "clubMembers"

  async function loadStudents() {
    const res = await api.get("/api/admin/users/filter/student");
    setUsers(res.data);
    setView("students");
  }

  async function loadClubMembers() {
    const res = await api.get("/api/admin/users/filter/clubMember");
    setUsers(res.data);
    setView("clubMembers");
  }

  async function search() {
    const res = await api.get(`/api/admin/users/search?q=${query}`);
    const filtered = res.data.filter(u =>
      view === "students"
        ? u.role === "student"
        : u.role === "clubMember"
    );
    setUsers(filtered);
  }

  async function promote(uid) {
    await api.put("/api/admin/users/role", { uid, newRole: "clubMember" });
    loadStudents(); // refresh student list
  }

  async function demote(uid) {
    await api.put("/api/admin/users/role", { uid, newRole: "student" });
    loadClubMembers(); // refresh clubMember list
  }

  useEffect(() => {
    loadStudents(); // default view
  }, []);

  return (
    <div className="manage-students-page">
      <h2>Manage Students & Club Members</h2>

      {/* Toggle buttons */}
      <div className="toggle-buttons">
        <button
          className={view === "students" ? "active" : ""}
          onClick={loadStudents}
        >
          Show Students
        </button>

        <button
          className={view === "clubMembers" ? "active" : ""}
          onClick={loadClubMembers}
        >
          Show Club Members
        </button>
      </div>

      {/* Search */}
      <input
        placeholder={`Search ${view === "students" ? "students" : "club members"}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={search}>Search</button>

      {/* Table */}
      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Action</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.uid}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>

              <td>
                {view === "students" ? (
                  <button className="promote-btn" onClick={() => promote(u.uid)}>
                    Promote
                  </button>
                ) : (
                  <button className="demote-btn" onClick={() => demote(u.uid)}>
                    Demote
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
