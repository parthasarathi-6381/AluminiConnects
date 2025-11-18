import React, { useEffect, useState } from "react";
import api from "../utils/api";
import "./AdminDashboardHome.css";

export default function AdminDashboardHome() {
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({
    students: 0,
    alumni: 0,
    events: 0,
    jobs: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const [pRes, cRes] = await Promise.all([
          api.get("/api/admin/profile"),
          api.get("/api/admin/counts"),
        ]);
        setProfile(pRes.data);
        setCounts(cRes.data);
      } catch (err) {
        console.error("Dashboard load error:", err);
      }
    }
    load();
  }, []);

  return (
    <div
      className="dashboard-home"
      style={{
        minHeight: "100vh",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        gap: "30px",
        alignItems: "center",
        background: "linear-gradient(135deg, #0a0f24, #2b1047)",
        color: "white",
      }}
    >
      {/* PROFILE CARD */}
      <div
  className="admin-profile-box"
  style={{
    width: "450px",
    background: "rgba(255, 255, 255, 0.07)",
    borderRadius: "22px",
    padding: "40px 30px",
    margin: "auto",
    backdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    boxShadow: "0 0 25px rgba(0,0,0,0.4)",
    textAlign: "center",
  }}
>
  <h2
    style={{
      fontWeight: "700",
      marginBottom: "25px",
      background: "linear-gradient(90deg,#d56bff,#6c8bff)",
      WebkitBackgroundClip: "text",
      color: "transparent",
    }}
  >
    My Profile
  </h2>

  {/* Avatar */}
  <div
    style={{
      width: "95px",
      height: "95px",
      borderRadius: "50%",
      margin: "0 auto 25px auto",
      background: "linear-gradient(145deg,#c47bff,#7483ff)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "40px",
      fontWeight: "700",
      color: "white",
    }}
  >
    {profile?.name?.[0]?.toUpperCase() || "A"}
  </div>

  {/* Info Fields */}
 {/* Info Fields */}
{[
  { label: "Name", value: profile?.name },
  { label: "Email", value: profile?.email },
  { label: "Role", value: profile?.role },
  { label: "Department", value: profile?.department },
].map((item, i) => (
  <div
    key={i}
    style={{
      marginBottom: "18px",
      display: "grid",
      gridTemplateColumns: "1fr 2fr",
      alignItems: "center",
      width: "100%",
      gap: "10px",
    }}
  >
    {/* LABEL */}
    <div
      style={{
        fontSize: "16px",
        opacity: 0.85,
        textAlign: "left",
      }}
    >
      {item.label} :
    </div>

    {/* VALUE */}
    <div
      style={{
        fontSize: "17px",
        fontWeight: 600,
        textAlign: "left",
      }}
    >
      {item.value || "—"}
    </div>

    <div
      style={{
        gridColumn: "1 / span 2",
        height: "1px",
        background: "rgba(255,255,255,0.18)",
        marginTop: "6px",
      }}
    ></div>
  </div>
))}

</div>


      {/* STATS */}
      <div
        className="stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: "20px",
          width: "90%",
          maxWidth: "900px",
        }}
      >
        {Object.entries(counts).map(([key, value]) => (
          <div
            className="stat-card"
            key={key}
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "25px",
              borderRadius: "16px",
              textAlign: "center",
              border: "1px solid rgba(255,255,255,0.18)",
              backdropFilter: "blur(10px)",
              fontWeight: "600",
              transition: "0.3s",
            }}
          >
            <h4 style={{ textTransform: "capitalize" }}>{key}</h4>
            <p
  className="stat-number"
  style={{
    fontSize: "40px",
    fontWeight: "800",
    marginTop: "10px",
    background: "linear-gradient(90deg,#ff77ff,#77a6ff)",
    WebkitBackgroundClip: "text",
    color: "transparent",
  }}
>

              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
