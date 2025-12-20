import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { createPortal } from "react-dom";

export default function Home() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await api.get("/api/achievements");
      setAchievements(res.data.achievements || []);
    } catch (err) {
      console.error("Error fetching achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAchievement(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      closeModal();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOYWw4b6HCcRb-pZPy-T2DeswrkJDENaQoaA&s")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Overlay for better readability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: -1
      }}></div>

      {/* Header Section with Semi-transparent Background */}
      <header style={{
        background: 'rgba(106, 17, 203, 0.85)',
        color: 'white',
        padding: '25px 0',
        flexShrink: 0,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container">
          <div className="text-center">
            <h1 className="display-5 fw-bold mb-2" style={{textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'}}>🏆 Achievements</h1>
            <p className="lead mb-0" style={{color: '#e6d6ff', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'}}>
              Celebrating excellence and success
            </p>
          </div>
        </div>
      </header>

      {/* Main Content - Takes remaining space */}
      <main className="flex-grow-1 py-4" style={{flex: 1}}>
        <div className="container">
          {loading ? (
            <div className="text-center py-5" style={{color: 'white'}}>
              <div className="spinner-border" style={{width: '3rem', height: '3rem', color: '#e6d6ff'}} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading achievements...</p>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center py-5">
              <div className="alert mx-auto" style={{
                maxWidth: '500px',
                backgroundColor: 'rgba(240, 230, 255, 0.9)',
                borderColor: '#d4bfff',
                color: '#6a11cb',
                backdropFilter: 'blur(5px)'
              }}>
                <h4 className="alert-heading">No achievements yet!</h4>
                <p className="mb-0">Check back soon for new achievements.</p>
              </div>
            </div>
          ) : (
            <div className="row g-4">
              {achievements.map((achievement) => (
                <div key={achievement._id} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
                  {/* Achievement Card with Glass Effect */}
                  <div 
                    className="card h-100 border-0"
                    onClick={() => handleAchievementClick(achievement)}
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      minHeight: '320px',
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    {/* Image Section */}
                    <div style={{
                      height: '160px',
                      overflow: 'hidden',
                      backgroundColor: 'rgba(248, 244, 255, 0.8)',
                      position: 'relative'
                    }}>
                      <img
                        src={achievement.imageUrl}
                        alt="Achievement"
                        className="w-100 h-100"
                        style={{
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1551135049-8a33b42738b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                          e.target.style.objectFit = 'cover';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        boxShadow: '0 2px 8px rgba(106, 17, 203, 0.4)',
                        backdropFilter: 'blur(5px)'
                      }}>
                        {new Date(achievement.createdAt).toLocaleDateString('en-US', { 
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="card-body p-3 d-flex flex-column" style={{
                      flexGrow: 1,
                      backgroundColor: 'transparent'
                    }}>
                      {/* Title */}
                      <h6 className="card-title fw-bold mb-2" style={{
                        color: '#6a11cb',
                        fontSize: '0.95rem',
                        lineHeight: '1.3',
                        minHeight: '2.4em',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                      }}>
                        {achievement.title || achievement.description.substring(0, 50) + '...'}
                      </h6>

                      {/* Author */}
                      <div className="mb-2" style={{flexShrink: 0}}>
                        <small className="text-muted" style={{fontSize: '0.8rem', color: '#7b5ebf'}}>
                          👤 {achievement.postedBy || 'Anonymous'}
                        </small>
                      </div>

                      {/* Description */}
                      <div style={{
                        flexGrow: 1,
                        marginBottom: '12px',
                        backgroundColor: 'transparent'
                      }}>
                        <p style={{
                          color: '#444444',
                          fontSize: '0.85rem',
                          lineHeight: '1.4',
                          margin: 0,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {achievement.description}
                        </p>
                      </div>

                      {/* View Button */}
                      <div className="mt-auto" style={{flexShrink: 0}}>
                        <div style={{
                          background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                          color: 'white',
                          padding: '10px',
                          textAlign: 'center',
                          borderRadius: '10px',
                          fontSize: '0.9rem',
                          fontWeight: '500',
                          cursor: 'pointer',
                          border: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
                          backdropFilter: 'blur(5px)'
                        }}>
                          View Details
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer - Fixed at bottom with Glass Effect */}
      <footer style={{
        background: 'rgba(106, 17, 203, 0.85)',
        color: 'white',
        padding: '25px 0',
        marginTop: 'auto',
        flexShrink: 0,
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="container">
          <div className="text-center">
            <p className="mb-2" style={{color: '#e6d6ff', fontSize: '1rem', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'}}>
              🏆 Celebrating Excellence
            </p>
            <p className="mb-0 small" style={{color: '#d4bfff', opacity: 0.9}}>
              © {new Date().getFullYear()} Alumni Connect . All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal with Violet Theme */}
      {showModal && selectedAchievement &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(106, 17, 203, 0.9)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              backdropFilter: "blur(10px)"
            }}
            onClick={closeModal}
          >
            <div
              style={{
                width: "100%",
                maxWidth: "800px",
                maxHeight: "90vh",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                borderRadius: "20px",
                boxShadow: "0 25px 50px rgba(0, 0, 0, 0.4)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.3)"
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Violet Gradient */}
              <div style={{
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                color: "white",
                padding: "25px",
                flexShrink: 0,
                borderBottom: "1px solid rgba(255, 255, 255, 0.2)"
              }}>
                <div className="d-flex justify-content-between align-items-start">
                  <div style={{flex: 1}}>
                    <h4 className="fw-bold mb-2" style={{margin: 0, color: 'white', textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)'}}>
                      {selectedAchievement.title || "Achievement Details"}
                    </h4>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '15px',
                      marginTop: '8px'
                    }}>
                      <small style={{color: 'rgba(255, 255, 255, 0.95)'}}>
                        <span style={{marginRight: '6px'}}>👤</span>
                        {selectedAchievement.postedBy || "Anonymous"}
                      </small>
                      <small style={{color: 'rgba(255, 255, 255, 0.95)'}}>
                        <span style={{marginRight: '6px'}}>📅</span>
                        {new Date(selectedAchievement.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    style={{
                      background: "rgba(255, 255, 255, 0.2)",
                      border: "none",
                      color: "white",
                      fontSize: "28px",
                      cursor: "pointer",
                      lineHeight: 1,
                      padding: '0',
                      marginLeft: '15px',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                    onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Body */}
              <div style={{ 
                overflowY: "auto", 
                backgroundColor: "transparent",
                flexGrow: 1
              }}>
                {/* Image */}
                <div style={{
                  padding: "30px",
                  backgroundColor: "rgba(248, 244, 255, 0.7)",
                  textAlign: "center"
                }}>
                  <div style={{
                    display: 'inline-block',
                    maxWidth: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 20px rgba(106, 17, 203, 0.2)',
                    backdropFilter: 'blur(5px)'
                  }}>
                    <img
                      src={selectedAchievement.imageUrl}
                      alt="Achievement"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "320px",
                        borderRadius: "8px",
                        display: 'block',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                      }}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1551135049-8a33b42738b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                      }}
                    />
                  </div>
                </div>

                {/* Description */}
                <div style={{ 
                  padding: "30px", 
                  backgroundColor: "transparent" 
                }}>
                  <h5 style={{
                    color: "#6a11cb",
                    marginBottom: "20px",
                    fontSize: "1.3rem",
                    fontWeight: "600",
                    textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)'
                  }}>
                    Description
                  </h5>
                  <div style={{
                    backgroundColor: "rgba(248, 244, 255, 0.8)",
                    padding: "25px",
                    borderRadius: "12px",
                    borderLeft: "5px solid #6a11cb",
                    backdropFilter: 'blur(5px)',
                    boxShadow: '0 4px 12px rgba(106, 17, 203, 0.15)'
                  }}>
                    <p style={{
                      color: "#333333",
                      lineHeight: 1.7,
                      fontSize: "1.05rem",
                      margin: 0
                    }}>
                      {selectedAchievement.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                padding: "20px",
                backgroundColor: "rgba(248, 244, 255, 0.8)",
                borderTop: "1px solid rgba(230, 214, 255, 0.5)",
                textAlign: "right",
                flexShrink: 0,
                backdropFilter: 'blur(5px)'
              }}>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                    color: "white",
                    border: "none",
                    padding: "12px 32px",
                    borderRadius: "10px",
                    fontWeight: 500,
                    fontSize: "1rem",
                    cursor: "pointer",
                    boxShadow: '0 4px 15px rgba(106, 17, 203, 0.3)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Custom CSS */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Card hover effects */
        .card {
          transition: all 0.3s ease !important;
        }

        .card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 16px 40px rgba(106, 17, 203, 0.25) !important;
          border-color: rgba(212, 191, 255, 0.5) !important;
          background-color: rgba(255, 255, 255, 0.95) !important;
        }

        .card:hover img {
          transform: scale(1.05) !important;
        }

        /* View button hover effect */
        .card:hover > .card-body > div:last-child > div {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(106, 17, 203, 0.4) !important;
        }

        /* Grid layout */
        .row {
          display: flex;
          flex-wrap: wrap;
          margin-right: -0.75rem;
          margin-left: -0.75rem;
        }

        .col-12, .col-sm-6, .col-md-4, .col-lg-3 {
          padding-right: 0.75rem;
          padding-left: 0.75rem;
          margin-bottom: 1rem;
        }

        /* Ensure proper card heights */
        @media (min-width: 576px) {
          .card {
            min-height: 340px;
          }
        }

        @media (min-width: 768px) {
          .card {
            min-height: 360px;
          }
        }

        @media (min-width: 992px) {
          .card {
            min-height: 380px;
          }
        }

        /* Modal scrollbar styling */
        div[style*="overflowY: auto"]::-webkit-scrollbar {
          width: 8px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-track {
          background: rgba(241, 241, 241, 0.8);
          border-radius: 4px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          border-radius: 4px;
        }

        div[style*="overflowY: auto"]::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #5a0db8 0%, #1c65e8 100%);
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          header h1 {
            font-size: 2rem !important;
          }
          
          div[style*="maxWidth: '800px'"] {
            margin: 10px !important;
          }
        }

        @media (max-width: 576px) {
          .col-12 {
            padding-right: 0.5rem;
            padding-left: 0.5rem;
          }
          
          .card > div:first-child {
            height: 140px !important;
          }
          
          div[style*="padding: '25px'"] {
            padding: 20px !important;
          }
          
          div[style*="padding: '30px'"] {
            padding: 20px !important;
          }
          
          header {
            padding: 20px 0 !important;
          }
          
          /* Improve background on mobile */
          body {
            background-attachment: scroll !important;
          }
        }

        /* Footer fix */
        body, html, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }

        /* Ensure main content grows to push footer down */
        main {
          min-height: auto !important;
        }

        /* Violet gradient text selection */
        ::selection {
          background-color: rgba(106, 17, 203, 0.3);
          color: white;
        }

        /* Smooth transitions */
        * {
          transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* Improve text readability on background */
        h1, h2, h3, h4, h5, h6, p, span, div {
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}