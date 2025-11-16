import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import PostFeed from "../components/PostFeed";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

// ClubMember pages
import ClubMemberCreateEvent from "./ClubMembers";
import MyEvents from "./MyEvents";
import MyEventRegistrations from "./MyEventRegistrations";
import "./StudentDashboard.css";

export default function StudentDashboard() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("feed");
  const [selectedEventId, setSelectedEventId] = useState(null);

  const navigate = useNavigate();

  // Load all posts
  useEffect(() => {
    async function load() {
      const p = await getDocs(collection(db, "posts"));
      setPosts(
        p.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !x.deleted)
      );
    }
    load();
  }, []);

  // Profile initials avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const loggingOut = () => {
    navigate("/login");
  };

  // Switch to registrations tab
  const handleViewRegistrations = (eventId) => {
    setSelectedEventId(eventId);
    setActiveTab("registrations");
  };

  // Reset selected event when switching pages
  const switchTab = (tab) => {
    setSelectedEventId(null);
    setActiveTab(tab);
  };

  return (
    <div className="dashboard" >
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <div className="card">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(profile?.name || profile?.email)}
            </div>

            <div className="profile-name">{profile?.name || "Student User"}</div>

            <div className="profile-title">
              {profile?.department} | {profile?.graduationYear - 4} - {profile?.graduationYear}
            </div>
          </div>
        </div>

        {/* CLUB MEMBER CONTROLS */}
        {profile?.role === "clubMember" && (
          <div className="card mt-4 p-3">
            <h4 className="text-white mb-3">Club Controls</h4>

            <button
              className={`btn w-100 mb-2 ${
                activeTab === "create" ? "btn-primary" : "btn-outline-light"
              }`}
              onClick={() => switchTab("create")}
            >
              Create Event
            </button>

            <button
              className={`btn w-100 mb-2 ${
                activeTab === "my-events" ? "btn-primary" : "btn-outline-light"
              }`}
              onClick={() => switchTab("my-events")}
            >
              My Events
            </button>
          </div>
        )}

        <button className="btn btn-danger w-100 mt-4" onClick={loggingOut}>
          Logout
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="content">
        <div className="section-title">
          <h2>
            {activeTab === "feed" && "Student Dashboard"}
            {activeTab === "create" && "Create Event"}
            {activeTab === "my-events" && "My Events"}
            {activeTab === "registrations" && "Event Registrations"}
          </h2>

          <div className="muted">Welcome {profile?.name || profile?.email}</div>
        </div>

        {/* FEED PAGE */}
        {activeTab === "feed" && (
          <div className="card" style={{ marginBottom: 16 }}>
            <PostFeed posts={posts} />
          </div>
        )}

        {/* CREATE EVENT PAGE */}
        {activeTab === "create" && <ClubMemberCreateEvent />}

        {/* MY EVENTS PAGE */}
        {activeTab === "my-events" && (
          <MyEvents onViewRegistrations={handleViewRegistrations} />
        )}

        {/* EVENT REGISTRATIONS PAGE */}
        {activeTab === "registrations" && selectedEventId && (
          <MyEventRegistrations eventId={selectedEventId} />
        )}

      </main>
    </div>
  );
}
