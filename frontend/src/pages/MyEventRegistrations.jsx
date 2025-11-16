import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./StudentDashboard.css";

export default function MyEventRegistrations({ eventId }) {
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
  if (!eventId) return;

  async function load() {
    try {
      const res = await api.get(`/api/events/${eventId}/registrations`);
      
      // FIXED HERE 🔥
      setRegistrations(res.data.registeredUsers || []);

    } catch (err) {
      console.error("Error loading registrations:", err);
    }
  }
  load();
}, [eventId]);


  return (
    <div className="container mt-4 text-white">
      <h2>Event Registrations</h2>

      {registrations.length === 0 ? (
        <p>No one has registered yet.</p>
      ) : (
        <table className="table table-dark mt-3">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Registered At</th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((reg) => (
              <tr key={reg._id}>
                <td>{reg.name}</td>
                <td>{reg.email}</td>
                <td>{reg.role}</td>
                <td>{new Date(reg.registeredAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
