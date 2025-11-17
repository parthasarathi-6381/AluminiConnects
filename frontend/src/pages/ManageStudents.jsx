// src/pages/ManageStudents.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./ManageStudents.css";

export default function ManageStudents() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("students");

  // LOAD STUDENTS
  async function loadStudents() {
    const res = await api.get("/api/admin/users/filter/student");
    setUsers(res.data);
    setView("students");
  }

  // LOAD CLUB MEMBERS
  async function loadClubMembers() {
    const res = await api.get("/api/admin/users/filter/clubmember");
    setUsers(res.data);
    setView("clubMembers");
  }

  // SEARCH
  async function search() {
    if (!query.trim()) {
      view === "students" ? loadStudents() : loadClubMembers();
      return;
    }

    const res = await api.get(`/api/admin/users/search?q=${query}`);

    const filtered = res.data.filter((u) =>
      view === "students"
        ? u.role === "student"
        : u.role === "clubMember"
    );

    setUsers(filtered);
  }

  // PROMOTE TO CLUB MEMBER
  async function promote(uid) {
    await api.put("/api/admin/users/role", { uid, newRole: "clubMember" });
    loadStudents();
  }

  // DEMOTE TO STUDENT
  async function demote(uid) {
    await api.put("/api/admin/users/role", { uid, newRole: "student" });
    loadClubMembers();
  }

  useEffect(() => {
    loadStudents(); // default tab
  }, []);

  return (
    <div className="manage-students-page">
      <h2>Manage Students & Club Members</h2>

      {/* TOGGLE BUTTONS */}
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

      {/* SEARCH BOX */}
      <div className="search-row">
        <input
          placeholder={
            view === "students"
              ? "Search students..."
              : "Search club members..."
          }
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button onClick={search}>Search</button>
      </div>

      {/* USERS TABLE */}
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
