import React, { useEffect, useState } from "react";
import api from "../utils/api";

export default function MyEventRegistrations({ eventId }) {
  const [registrations, setRegistrations] = useState([]);

  const styles = {
    container: {
      padding: "20px",
      color: "white",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
      marginTop: "20px",
      width: "100%",
    },

    panel: {
      background: "rgba(0,0,0,0.35)",
      borderRadius: "15px",
      padding: "25px 35px",
      display: "inline-block",
      boxShadow: "0 8px 25px rgba(0,0,0,0.35)",
      backdropFilter: "blur(8px)",
    },

    heading: {
      fontSize: "24px",
      fontWeight: "700",
      marginBottom: "18px",
    },

    exportBtn: {
      padding: "10px 17px",
      background: "linear-gradient(135deg, #00c853, #00e676)",
      color: "white",
      border: "none",
      fontWeight: 600,
      borderRadius: "8px",
      cursor: "pointer",
      marginBottom: "15px",
      boxShadow: "0 3px 10px rgba(0,255,100,0.25)",
    },

    table: {
      width: "100%",
      borderCollapse: "collapse",
      background: "rgba(0, 0, 0, 0.40)",
      borderRadius: "12px",
      overflow: "hidden",
      tableLayout: "auto",
      display: "table",
    },

    theadRow: { display: "table-row" },
    tbodyRow: { display: "table-row" },

    th: {
      padding: "12px 18px",
      background: "rgba(255,255,255,0.15)",
      color: "white",
      fontWeight: 700,
      textAlign: "left",
      borderBottom: "1px solid rgba(255,255,255,0.25)",
      whiteSpace: "nowrap",
    },

    td: {
      padding: "12px 18px",
      borderBottom: "1px solid rgba(255,255,255,0.1)",
      color: "white",
      display: "table-cell",
      whiteSpace: "nowrap",
      verticalAlign: "middle",
    },

    noData: {
      padding: "20px",
      opacity: 0.7,
      textAlign: "center",
    },
  };

  useEffect(() => {
    if (!eventId) return;

    async function load() {
      try {
        const res = await api.get(`/api/events/${eventId}/registrations`);
        setRegistrations(res.data.registeredUsers || []);
      } catch (err) {
        console.error("Error loading registrations:", err);
      }
    }

    load();
  }, [eventId]);

  const handleExport = async () => {
    try {
      const res = await api.get(
        `/api/events/${eventId}/registrations/export`,
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "event_registrations.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download Excel");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.panel}>
        <h2 style={styles.heading}>Event Registrations</h2>

        <button style={styles.exportBtn} onClick={handleExport}>
          ⬇ Export to Excel
        </button>

        {registrations.length === 0 ? (
          <p style={styles.noData}>No one has registered yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Registered At</th>
              </tr>
            </thead>

            <tbody>
              {registrations.map((reg) => (
                <tr key={reg._id} style={styles.tbodyRow}>
                  <td style={styles.td}>{reg.name}</td>
                  <td style={styles.td}>{reg.email}</td>
                  <td style={styles.td}>{reg.role}</td>
                  <td style={styles.td}>
                    {new Date(reg.registeredAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
