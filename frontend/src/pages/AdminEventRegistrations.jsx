// src/pages/AdminEventRegistrations.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useParams } from "react-router-dom";
import "./AdminEventRegistrations.css";

export default function AdminEventRegistrations() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    load(page);
  }, [page]);

  async function load(pageNum) {
    try {
      const res = await api.get(`/api/events/${eventId}/registrations?page=${pageNum}`);
      setEvent(res.data.event);
      setRegistrations(res.data.registeredUsers);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
      alert("Failed to load registrations");
    }
  }

  // 🔥 FIXED DOWNLOAD FUNCTION WITH TOKEN
  async function handleExport() {
    try {
      const res = await api.get(
        `/api/events/${eventId}/registrations/export`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event?.title || "event"}_registrations.xlsx`;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to download Excel file");
    }
  }

  return (
    <div className="admin-reg-container">
      <h2>Registrations for: {event?.title}</h2>
      <p><strong>Date:</strong> {event && new Date(event.date).toLocaleDateString()}</p>

      <button className="export-btn" onClick={handleExport}>
        ⬇ Export to Excel
      </button>

      <table className="reg-table">
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Role</th><th>Registered At</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r._id}>
              <td>{r.name}</td>
              <td>{r.email}</td>
              <td>{r.role}</td>
              <td>{new Date(r.registeredAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        {page > 1 && <button onClick={() => setPage(page - 1)}>Previous</button>}
        {page < pagination.totalPages && (
          <button onClick={() => setPage(page + 1)}>Next</button>
        )}
      </div>
    </div>
  );
}
