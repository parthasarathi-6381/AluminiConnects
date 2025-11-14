import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function ManageAlumni() {
  const [alumni, setAlumni] = useState([]);

  async function load() {
    const res = await api.get("/api/admin/users/filter/alumni");
    setAlumni(res.data);
  }

  async function verify(uid) {
    await api.put("/api/admin/users/verify", { uid });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h2>Verify Alumni</h2>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Verified</th><th>Action</th>
          </tr>
        </thead>
        <tbody>
          {alumni.map((a) => (
            <tr key={a.uid}>
              <td>{a.name}</td>
              <td>{a.email}</td>
              <td>{a.verified ? "✔️" : "❌"}</td>
              <td>
                {!a.verified && (
                  <button onClick={() => verify(a.uid)}>Verify</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
