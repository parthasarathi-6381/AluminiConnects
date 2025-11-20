import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useAuth } from "../components/AuthProvider";

export default function MyEvents({ onViewRegistrations }) {
  const [events, setEvents] = useState([]);
  const { profile } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/api/events/my-events");
        setEvents(res.data);
      } catch (err) {
        console.error("Error loading my events:", err);
      }
    }
    load();
  }, []);

  async function deleteEvent(id) {
    if (!window.confirm("Delete this event?")) return;

    try {
      await api.delete(`/api/events/${id}`);
      setEvents((prev) => prev.filter((ev) => ev._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting event");
    }
  }

  const containerStyle = {
    background: "transparent",
    padding: "20px",
  };

  const eventCardStyle = {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "15px",
  };

  return (
    <div className="container mt-4 text-white" style={containerStyle}>
      <h2>My Created Events</h2>

      <div className="mt-4">
        {events.length === 0 && <p>No events created yet.</p>}

        {events.map((ev) => {
          const canDelete =
            profile?.role === "admin" ||
            ev?.createdBy?.uid === profile?.uid;

          return (
            <div key={ev._id} style={eventCardStyle}>
              <h4 className="text-info">{ev.title}</h4>
              <p><strong>Date:</strong> {ev.date.split("T")[0]}</p>
              <p><strong>Venue:</strong> {ev.venue}</p>

              <button
                className="btn btn-outline-info btn-sm me-2"
                onClick={() => onViewRegistrations(ev._id)}
              >
                View Registrations
              </button>

              {canDelete && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteEvent(ev._id)}
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
