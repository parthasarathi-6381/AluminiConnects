import React, { useState } from "react";
import api from "../utils/api";
import "./StudentDashboard.css";
export default function ClubMemberCreateEvent() {
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    capacity: 50,
  });

  const [message, setMessage] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/events/create", eventData);
      setMessage("Event created successfully!");

      setEventData({
        title: "",
        description: "",
        date: "",
        venue: "",
        capacity: 50,
      });

      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Error creating event");
    }
  };

  return (
    <div className="container mt-4 text-white">
      <h2>Create Event</h2>

      {message && <div className="alert alert-info">{message}</div>}

      <form onSubmit={handleCreate} className="mt-3">
        
        <input
          className="form-control mb-3"
          placeholder="Event Title"
          value={eventData.title}
          onChange={(e) =>
            setEventData({ ...eventData, title: e.target.value })
          }
          required
        />

        <textarea
          className="form-control mb-3"
          placeholder="Description"
          rows="3"
          value={eventData.description}
          onChange={(e) =>
            setEventData({ ...eventData, description: e.target.value })
          }
          required
        />

        <input
          className="form-control mb-3"
          type="date"
          value={eventData.date}
          onChange={(e) =>
            setEventData({ ...eventData, date: e.target.value })
          }
          required
        />

        <input
          className="form-control mb-3"
          placeholder="Venue"
          value={eventData.venue}
          onChange={(e) =>
            setEventData({ ...eventData, venue: e.target.value })
          }
          required
        />

        <input
          className="form-control mb-3"
          type="number"
          placeholder="Capacity"
          value={eventData.capacity}
          onChange={(e) =>
            setEventData({ ...eventData, capacity: e.target.value })
          }
        />

        <button className="btn btn-primary">Create Event</button>
      </form>
    </div>
  );
}
