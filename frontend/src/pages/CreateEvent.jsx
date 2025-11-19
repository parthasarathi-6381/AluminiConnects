// src/pages/CreateEvent.jsx
import React, { useState } from "react";
import api from "../utils/api";
import ReactQuill from "react-quill";
import DatePicker from "react-datepicker";
import { useAuth } from "../components/AuthProvider";
import { useNavigate } from "react-router-dom";

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

  const { profile } = useAuth();
  const navigate = useNavigate();

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
      setTitle("");
      setDescription("");
      setVenue("");
      setCapacity("");
      setEventDate(new Date());
      setEventTime(new Date());
    } catch (err) {
      alert("Failed: " + (err.response?.data?.message || err.message));
    }
  };

  const quillModules = {
  toolbar: [
    ["bold", "italic", "underline", "strike"],      
    [{ header: 1 }, { header: 2 }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["link"],
    ["clean"],
  ],
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "link",
  "align",
];


  return (
  <div className="modern-wrapper">
    <div className="modern-container">
      <h2 className="page-title">Create Event</h2>

      <form className="form-modern" onSubmit={submitEvent}>
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
  modules={quillModules}
  formats={quillFormats}
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
          placeholder="Enter capacity (optional)"
        />

        <label>Event Date</label>
        <DatePicker
          selected={eventDate}
          onChange={setEventDate}
          className="date-picker"
        />

        <label>Event Time</label>
        <DatePicker
          selected={eventTime}
          onChange={setEventTime}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="h:mm aa"
          className="date-picker"
        />

        <button type="submit" className="btn-modern">
          Create Event
        </button>
      </form>
    </div>
  </div>
);

}
