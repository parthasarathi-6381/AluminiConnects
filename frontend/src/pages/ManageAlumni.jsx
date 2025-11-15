import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./ManageAlumni.css";

export default function ManageAlumni() {
  const [alumni, setAlumni] = useState([]);

  async function load() {
    const res = await api.get("/api/admin/users/filter/alumni");
    setAlumni(res.data);
  }

  // VERIFY ALUMNI
  async function verify(uid) {
    await api.put("/api/admin/users/verify", { uid });
    load();
  }

  // DELETE ALUMNI
  async function remove(uid) {
    await api.delete(`/api/admin/users/${uid}`);
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="manage-alumni-page">
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

              <td className="verified-column">
                {a.verified ? (
                  <span className="verified">✔</span>
                ) : (
                  <span className="not-verified">✘</span>
                )}
              </td>

              <td>
                {!a.verified && (
                  <button className="verify-btn" onClick={() => verify(a.uid)}>
                    Verify
                  </button>
                )}

                <button className="delete-btn" onClick={() => remove(a.uid)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
