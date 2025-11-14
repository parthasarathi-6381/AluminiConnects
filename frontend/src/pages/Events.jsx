// src/pages/Events.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./Events.css";

const TEXT_PREVIEW_LENGTH = 100;

function getPlainTextFromHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

// Determine event status based on date
function getEventStatus(dateString) {
  const today = new Date();
  const eventDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  eventDate.setHours(0, 0, 0, 0);

  if (eventDate > today) return "upcoming";
  if (eventDate < today) return "ended";
  return "ongoing";
}

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/api/events/");
        setEvents(res.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setErrorMsg(err.response?.data?.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  async function deleteEvent(id) {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await api.delete(`/api/events/${id}`);
      setEvents(prev => prev.filter(ev => ev._id !== id));
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert(err.response?.data?.message || "Failed to delete event");
    }
  }

  if (loading) return <div className="loading">Loading events…</div>;
  if (errorMsg) return <div className="error">{errorMsg}</div>;

  return (
    <div className="events-page">
      <h2 className="events-title">All Events</h2>

      <div className="events-grid">
        {events.map((ev) => {
          const plain = getPlainTextFromHtml(ev.description);
          const preview =
            plain.length > TEXT_PREVIEW_LENGTH
              ? plain.slice(0, TEXT_PREVIEW_LENGTH).trim() + "..."
              : plain;

          const formattedDate = ev.date
            ? new Date(ev.date)
                .toISOString()
                .split("T")[0]
                .split("-")
                .reverse()
                .join("-")
            : "-";

          const status = getEventStatus(ev.date);

          return (
            <div key={ev._id} className="event-card">
              <div className="event-card-head">
                <h3 className="event-title">{ev.title}</h3>
                <span className={`status-badge ${status}`}>
                  {status.toUpperCase()}
                </span>
              </div>

              <p className="event-date">{formattedDate}</p>

              <p className="event-meta">
                <strong>Venue:</strong> {ev.venue}
              </p>
              <p className="event-meta">
                <strong>Capacity:</strong> {ev.capacity}
              </p>

              <div className="event-description">
                <strong>Description:</strong>
                <div className="event-description-text">{preview}</div>
              </div>

              <button
                className="delete-btn"
                onClick={() => deleteEvent(ev._id)}
              >
                🗑
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
