import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./AdminLayout.css";

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");

  async function load() {
    const res = await api.get("/api/admin/users/filter/student");
    setStudents(res.data);
  }

  async function search() {
    const res = await api.get(`/api/admin/users/search?q=${query}`);
    setStudents(res.data.filter(u => u.role === "student"));
  }

  async function promote(uid) {
    await api.put("/api/admin/users/role", { uid, newRole: "clubMember" });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Manage Students</h2>

      <input
        placeholder="Search student..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={search}>Search</button>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Action</th>
          </tr>
        </thead>

        <tbody>
          {students.map((s) => (
            <tr key={s.uid}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{s.role}</td>
              <td>
                <button onClick={() => promote(s.uid)}>Promote</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
