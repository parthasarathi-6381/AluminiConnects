// src/pages/Events.jsx
import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./Events.css";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";
import "./StudentDashboard.css";

const TEXT_PREVIEW_LENGTH = 100;

function getPlainTextFromHtml(html) {
  if (!html) return "";
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

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
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/api/events/");
        setEvents(res.data.events || []);
      } catch (err) {
        setErrorMsg("Failed to load events");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  async function deleteEvent(eventId) {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/api/events/${eventId}`);
      setEvents((prev) => prev.filter((ev) => ev._id !== eventId));
    } catch {
      alert("Failed to delete event");
    }
  }

  async function handleRegister(eventId) {
    try {
      await api.post(`/api/events/${eventId}/register`);
      alert("Successfully registered!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to register");
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
              ? plain.slice(0, TEXT_PREVIEW_LENGTH) + "..."
              : plain;

          const status = getEventStatus(ev.date);

          const formattedDate = ev.date
            ? new Date(ev.date).toISOString().split("T")[0].split("-").reverse().join("-")
            : "-";

          return (
            <div key={ev._id} className="event-card">
              <div className="event-card-head">
                <h3>{ev.title}</h3>
                <span className={`status-badge ${status}`}>
                  {status.toUpperCase()}
                </span>
              </div>

              <p className="event-date">{formattedDate}</p>
              <p className="event-meta"><strong>Venue:</strong> {ev.venue}</p>
              <p className="event-meta"><strong>Capacity:</strong> {ev.capacity}</p>

              <div className="event-description">
                <strong>Description:</strong>
                <div className="event-description-text">{preview}</div>
              </div>

              {/* Admin: View registrations */}
              {profile?.role === "admin" && (
                <button
                  className="view-btn"
                  onClick={() => navigate(`/admin/event/${ev._id}/registrations`)}
                >
                  📋 View Registrations
                </button>
              )}

              {/* Admin: Delete */}
              {profile?.role === "admin" && (
                <button className="delete-btn" onClick={() => deleteEvent(ev._id)}>
                  🗑 Delete
                </button>
              )}

              {/* Students + Alumni + club members => apply */}
              {(profile?.role === "student" ||
                profile?.role === "alumni" ||
                profile?.role === "clubMember") && (
                <button className="apply-btn" onClick={() => handleRegister(ev._id)}>
                  Apply
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
