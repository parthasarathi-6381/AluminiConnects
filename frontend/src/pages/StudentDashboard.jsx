import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import PostFeed from "../components/PostFeed";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

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

  useEffect(() => {
    async function load() {
      const p = await getDocs(collection(db, "posts"));
      setPosts(p.docs.map((d) => ({ id: d.id, ...d.data() })).filter((x) => !x.deleted));
    }
    load();
  }, []);

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase() : "U";

  const loggingOut = () => navigate("/login");

  const handleViewRegistrations = (eventId) => {
    setSelectedEventId(eventId);
    setActiveTab("registrations");
  };

  const switchTab = (tab) => {
    setSelectedEventId(null);
    setActiveTab(tab);
  };

 return (
  <div
    className="d-flex vh-100 position-relative overflow-hidden"
    style={{ background: "linear-gradient(135deg,#0d0f23,#2c0f49)" }}
  >

    {/* LEFT SIDEBAR */}
    <aside
      className="p-4 text-white d-flex flex-column"
      style={{
        width: 260,
        background: "rgba(255,255,255,0.05)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)"
      }}
    >
      <h4 className="fw-bold text-center mb-4">Student Panel</h4>

      {/* 🔹 MOVE PROFILE FIRST */}
<button
  className={`btn mb-2 ${activeTab === "profile" ? "btn-primary" : "btn-outline-light"}`}
  onClick={() => switchTab("profile")}
>
  My Profile
</button>

<button
  className={`btn mb-2 ${activeTab === "feed" ? "btn-primary" : "btn-outline-light"}`}
  onClick={() => switchTab("feed")}
>
  Feed
</button>


      {profile?.role === "clubMember" && (
        <>
          <button
            className={`btn mb-2 ${activeTab === "create" ? "btn-primary" : "btn-outline-light"}`}
            onClick={() => switchTab("create")}
          >
            Create Event
          </button>

          <button
            className={`btn mb-2 ${activeTab === "my-events" ? "btn-primary" : "btn-outline-light"}`}
            onClick={() => switchTab("my-events")}
          >
            My Events
          </button>
        </>
      )}

      <button className="btn btn-danger mt-auto" onClick={loggingOut}>
        Logout
      </button>
    </aside>

    {/* MAIN CONTENT */}
    <main className="flex-grow-1 p-4 overflow-auto text-white">

      <h2 className="fw-bold mb-2 text-white">
        {activeTab === "feed" && "Student Dashboard"}
        {activeTab === "profile" && "My Profile"}
        {activeTab === "create" && "Create Event"}
        {activeTab === "my-events" && "My Events"}
        {activeTab === "registrations" && "Event Registrations"}
      </h2>

      <p className="text-muted mb-4">
        Welcome {profile?.name || profile?.email}
      </p>

      {/* 🔹 PROFILE PAGE (ALUMNI STYLE) */}
      {activeTab === "profile" && (
  <div className="d-flex justify-content-center align-items-center">
    <div className="profile-card p-5 text-white text-center">
         <h2 className="fw-bold text-gradient mb-4">My Profile</h2>
      <div className="avatar-circle mb-3">
        {profile?.name ? profile.name[0].toUpperCase() : "?"}
      </div>

     

     <div className="profile-details">
  <div className="detail-row">
    <span className="label">Name:</span>
    <span className="value">{profile?.name}</span>
  </div>

  <div className="detail-row">
    <span className="label">Email:</span>
    <span className="value">{profile?.email}</span>
  </div>

  <div className="detail-row">
    <span className="label">Batch:</span>
    <span className="value">
      {profile?.graduationYear - 4} - {profile?.graduationYear}
    </span>
  </div>

  <div className="detail-row">
    <span className="label">Department:</span>
    <span className="value">{profile?.department}</span>
  </div>
</div>


    </div>
  </div>
)}


      {activeTab === "feed" && (
        <div className="content-card p-3">
          <PostFeed posts={posts} />
        </div>
      )}

      {activeTab === "create" && (
        <div className="content-card p-4 dark-form">
          <ClubMemberCreateEvent />
        </div>
      )}

      {activeTab === "my-events" && (
        <div className="content-card p-4">
          <MyEvents onViewRegistrations={handleViewRegistrations} />
        </div>
      )}

      {activeTab === "registrations" && selectedEventId && (
        <div className="content-card p-4">
          <MyEventRegistrations eventId={selectedEventId} />
        </div>
      )}
    </main>

    {/* SHARED STYLES */}
    <style>{`
      .avatar-circle {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b388ff, #ff6bff);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.4rem;
  font-weight: bold;
  margin: 0 auto 15px auto;
  color: white;
}

      .content-card {
  max-width: 650px;
  margin: auto;
  background: rgba(0,0,0,0.55);   /* DARK BOX */
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
}
.dark-form input,
.dark-form textarea,
.dark-form select {
  background: rgba(0,0,0,0.6) !important;
  color: white !important;
  border: 1px solid rgba(255,255,255,0.3) !important;
}

.dark-form ::placeholder {
  color: rgba(255,255,255,0.7) !important;
}
  .profile-card {
  width: 450px;
  background: rgba(255,255,255,0.05);
  border-radius: 20px;
  box-shadow: 0 0 25px rgba(255,255,255,0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
}

.profile-line {
  font-size: 1.15rem;
  margin-bottom: 8px;
}

.text-gradient {
  background: linear-gradient(90deg, #b388ff, #ff6bff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
  .profile-details {
  width: 100%;
  margin-top: 10px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.15);
}

.detail-row:last-child {
  border-bottom: none;
}

.label {
  font-weight: 600;
  font-size: 1.05rem;
  opacity: 0.75;
}

.value {
  font-size: 1.05rem;
  font-weight: 500;
}
  .profile-details .detail-row span:first-child {
  font-weight: 700;      /* bold LABEL */
  opacity: 1 !important; /* make label fully visible */
}

.profile-details .detail-row span:last-child {
  font-weight: 400;      /* normal VALUE */
  opacity: 0.85;         /* keep value slightly softer */
}



    `}</style>

  </div>
);

}
