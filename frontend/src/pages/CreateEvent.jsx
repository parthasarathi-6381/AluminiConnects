// src/pages/CreateEvent.jsx
import React, { useState } from "react";
import api from "../utils/api";
import ReactQuill from "react-quill";
import DatePicker from "react-datepicker";

import "react-quill/dist/quill.snow.css";
import "react-datepicker/dist/react-datepicker.css";
import "./CreatePages.css";

export default function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [capacity, setCapacity] = useState("");
  const [eventDate, setEventDate] = useState(new Date());
  const [eventTime, setEventTime] = useState(new Date());

  

  const submitEvent = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("venue", venue);
    if (capacity) form.append("capacity", capacity);
    form.append("date", eventDate.toISOString());
    form.append("time", eventTime.toISOString());

    try {
      const res = await api.post("/api/events/create", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.message || "Event Created Successfully!");
      // optionally reset form or navigate
    } catch (err) {
      console.error("Error creating event:", err);
      alert("Failed to create event: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="create-container">
      <h2>Create Event</h2>

      <form className="create-form" onSubmit={submitEvent}>
        <label>Event Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter event title"
          required
        />

        <label>Description</label>
        <ReactQuill
          value={description}
          onChange={setDescription}
          theme="snow"
        />

        <label>Venue</label>
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Enter venue"
          required
        />

        <label>Capacity</label>
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Enter capacity"
        />

       
        

        <label>Event Date</label>
        <DatePicker selected={eventDate} onChange={setEventDate} />

        <label>Event Time</label>
        <DatePicker
          selected={eventTime}
          onChange={setEventTime}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
        />

        <button type="submit" className="submit-btn">
          Create Event
        </button>
      </form>
    </div>
  );
}
