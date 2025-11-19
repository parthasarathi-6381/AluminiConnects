import React from "react";

export default function TopBar() {
  return (
   <div
  style={{
    height: "65px",
    width: "calc(100% - 250px)",   // full width minus sidebar
    marginLeft: "250px",
    display: "flex",
    justifyContent: "center",      // PERFECT CENTER
    alignItems: "center",
    position: "sticky",
    top: 0,
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(255,255,255,0.25)",
    zIndex: 999
  }}
>

      <h2
        style={{
          margin: 0,
          fontSize: "26px",
          fontWeight: "700",
          letterSpacing: "0.8px",
          color: "#ffffff",
          fontFamily: "'Poppins', sans-serif",
          textShadow: "0px 1px 8px rgba(255,255,255,0.4)",
        }}
      >
        Welcome, Admin
      </h2>
    </div>
  );
}
