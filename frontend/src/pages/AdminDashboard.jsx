import React, { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import './AdminDashboard.css'
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function AdminDashboard() {

  const { currentUser, profile } = useAuth()
  const [alumni, setAlumni] = useState([])
  const [events, setEvents] = useState([])
  const [posts, setPosts] = useState([])
  const [showEventForm, setShowEventForm] = useState(false)

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    capacity: 100,
    venue: "",
    images: []
  })

  // ======================================
  // LOAD ALUMNI, EVENTS, POSTS
  // ======================================
  useEffect(() => {
    async function load() {
      // Get alumni
      const alumniRes = await fetch(`${API_BASE}/api/users?role=alumni`)
      if (alumniRes.ok) {
        const data = await alumniRes.json()
        setAlumni(data)
      }

      // Get events
      const eventRes = await fetch(`${API_BASE}/api/events`)
      if (eventRes.ok) {
        const ev = await eventRes.json()
        setEvents(ev)
      }
    }
    load()
  }, [])

  // ================================
  // HANDLE EVENT INPUTS
  // ================================
  const handleEventChange = (e) => {
    const { name, value } = e.target
    setNewEvent({ ...newEvent, [name]: value })
  }

  const handleImageUpload = (e) => {
    setNewEvent({ ...newEvent, images: Array.from(e.target.files) })
  }

  // ================================
  // SUBMIT EVENT
  // ================================
  const submitEvent = async (e) => {
    e.preventDefault()

    const fd = new FormData()
    fd.append("title", newEvent.title)
    fd.append("description", newEvent.description)
    fd.append("date", newEvent.date)
    fd.append("capacity", newEvent.capacity)
    fd.append("venue", newEvent.venue)

    // CreatedBy injected from admin profile
    fd.append("createdBy_uid", profile.uid)
    fd.append("createdBy_name", profile.name)
    fd.append("createdBy_role", profile.role)

    newEvent.images.forEach(file => fd.append("images", file))

    const res = await fetch(`${API_BASE}/api/events`, {
      method: "POST",
      body: fd
    })

    if (res.ok) {
      const created = await res.json()
      setEvents([created, ...events])
      setShowEventForm(false)
    } else {
      alert("Event creation failed")
    }
  }

  return (
    <div className="admin-dashboard">
      
      {/* ========== TOP NAVBAR ========== */}
      <div className="admin-navbar">
        <h2>Admin Dashboard</h2>
        <button className="logout-btn" onClick={() => navigate('/login')}>Logout</button>
      </div>

      <div className="dashboard-grid">

        {/* LEFT SIDEBAR */}
        <aside className="sidebar">
          <div className="card">
            <h3>Admin Panel</h3>
            <p className="muted">Manage Users, Events, Posts</p>
          </div>

          <div className="card">
            <h4>Create</h4>
            <button className="btn" onClick={() => setShowEventForm(true)}>
              + Create Event
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="content">
          
          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{alumni.filter(a => !a.verified).length}</h3>
              <p>Unverified Alumni</p>
            </div>
            <div className="stat-card">
              <h3>{posts.length}</h3>
              <p>Total Posts</p>
            </div>
            <div className="stat-card">
              <h3>{events.length}</h3>
              <p>Total Events</p>
            </div>
          </div>

          {/* UNVERIFIED ALUMNI */}
          <div className="card">
            <h3>Unverified Alumni</h3>
            {alumni.filter(a => !a.verified).length === 0 && (
              <p className="muted">No unverified alumni</p>
            )}

            {alumni.filter(a => !a.verified).map((a) => (
              <div key={a._id} className="list-item">
                <strong>{a.email}</strong>
                <span className="muted">{a.batch} • {a.department}</span>
                <button className="btn small" onClick={() => verify(a._id)}>Verify</button>
              </div>
            ))}
          </div>

          {/* ALL EVENTS */}
          <div className="card">
            <h3>Events</h3>

            {events.map((ev) => (
              <div key={ev._id} className="event-item">
                <h4>{ev.title}</h4>
                <p>{ev.date?.substring(0, 10)} • {ev.venue}</p>
                <p className="muted">Status: {ev.status}</p>
              </div>
            ))}

          </div>

        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="rightbar">
          <div className="card">
            <h4>Latest</h4>
            <p className="muted">Event management active</p>
          </div>
        </aside>

      </div>

      {/* EVENT CREATION MODAL */}
      {showEventForm && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create Event</h2>

            <form onSubmit={submitEvent}>
              <label>Event Name</label>
              <input name="title" required onChange={handleEventChange} />

              <label>Description</label>
              <textarea name="description" required onChange={handleEventChange}></textarea>

              <label>Date</label>
              <input type="date" name="date" required onChange={handleEventChange} />

              <label>Venue</label>
              <input name="venue" required onChange={handleEventChange} />

              <label>Capacity</label>
              <input type="number" name="capacity" defaultValue={100} onChange={handleEventChange} />

              <label>Upload Images</label>
              <input type="file" multiple onChange={handleImageUpload} />

              <div className="modal-actions">
                <button type="button" className="btn cancel" onClick={() => setShowEventForm(false)}>Cancel</button>
                <button type="submit" className="btn">Create Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
