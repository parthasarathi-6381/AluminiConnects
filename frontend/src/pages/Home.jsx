import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Home() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await api.get("/api/achievements?limit=6");
      setAchievements(res.data.achievements || []);
    } catch (err) {
      console.error("Error fetching achievements:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">

      {/* Hero Section */}
      <section className="hero-section text-white d-flex flex-column justify-content-center align-items-center text-center">
        <h1 className="display-4 fw-bold">Welcome to Alumni Connect</h1>
        <p className="lead mt-3">
          Connecting students, alumni & opportunities — all in one place.
        </p>
        <button className="btn btn-primary btn-lg mt-4" onClick={() => navigate("/events")}>
          Explore Events 🚀
        </button>
      </section>

      {/* Achievements Section - Full width with side gaps */}
      <section className="achievements-section py-5">
        <div className="container-fluid px-4">
          <h2 className="fw-bold text-center mb-5">🏆 Recent Achievements</h2>
          
          {loading ? (
            <div className="text-center">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : achievements.length === 0 ? (
            <div className="text-center text-muted py-4">
              <p>No achievements to display yet.</p>
            </div>
          ) : (
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div key={achievement._id} className="achievement-card">
                  <div className="achievement-image-container">
                    <img
                      src={achievement.imageUrl}
                      alt="Achievement"
                      className="achievement-image"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1551135049-8a33b42738b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
                      }}
                    />
                  </div>
                  <div className="achievement-content">
                    <p className="achievement-description">{achievement.description}</p>
                    <div className="achievement-meta">
                      <small className="text-muted">
                        Posted by {achievement.postedBy}
                      </small>
                      <small className="text-muted">
                        {new Date(achievement.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section className="container py-5">
        <h2 className="fw-bold text-center mb-4">📅 Upcoming Events</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow event-card h-100">
              <img
                src="https://images.unsplash.com/photo-1531058020387-3be344556be6"
                className="card-img-top"
                alt="Event"
              />
              <div className="card-body">
                <h5 className="card-title">Alumni Meet 2025</h5>
                <p className="card-text text-muted">
                  Join alumni from around the world for a reunion and inspiring sessions.
                </p>
                <button className="btn btn-outline-primary w-100" onClick={() => navigate("/events")}>
                  View Events →
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow event-card h-100">
              <img
                src="https://images.pexels.com/photos-3183150/pexels-photo-3183150.jpeg"
                className="card-img-top"
                alt="Workshop"
              />
              <div className="card-body">
                <h5 className="card-title">Career Workshops</h5>
                <p className="card-text text-muted">
                  Learn directly from experts through alumni-led workshops.
                </p>
                <button className="btn btn-outline-primary w-100" onClick={() => navigate("/events")}>
                  Explore Workshops →
                </button>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card shadow event-card h-100">
              <img
                src="https://images.unsplash.com/photo-1551836022-4c4c79ecde51"
                className="card-img-top"
                alt="Seminar"
              />
              <div className="card-body">
                <h5 className="card-title">Tech Seminars</h5>
                <p className="card-text text-muted">
                  Attend technical sessions and upgrade your skills.
                </p>
                <button className="btn btn-outline-primary w-100" onClick={() => navigate("/events")}>
                  See Seminars →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section className="container py-5">
        <h2 className="fw-bold text-center mb-4">💼 Latest Job Opportunities</h2>
        <div className="row g-4">
          <div className="col-md-6">
            <div className="job-card p-4 shadow-sm rounded bg-light">
              <h4 className="fw-bold">100+ Jobs Posted</h4>
              <p className="text-muted">
                Alumni are actively posting internships, full-time roles & openings!
              </p>
              <button className="btn btn-success" onClick={() => navigate("/jobs")}>
                View Jobs →
              </button>
            </div>
          </div>

          <div className="col-md-6">
            <img
              src="https://images.unsplash.com/photo-1560264280-88b68371db39"
              className="img-fluid rounded shadow"
              alt="Jobs"
            />
          </div>
        </div>
      </section>

      {/* Alumni Interaction Section */}
      <section className="container py-5">
        <h2 className="fw-bold text-center mb-4">🤝 Alumni – Student Interaction</h2>
        <div className="row align-items-center g-4">
          <div className="col-md-6">
            <img
              src="https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg"
              className="img-fluid rounded shadow"
              alt="Interaction"
            />
          </div>

          <div className="col-md-6">
            <h4 className="fw-semibold">Guidance from the best.</h4>
            <p className="text-muted">
              Students can chat with alumni for mentorship, career guidance, and project support.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/messages")}
            >
              Start Chat →
            </button>
          </div>
        </div>
      </section>

      {/* Donations Section */}
      <section className="container py-5">
        <h2 className="fw-bold text-center mb-4">❤️ Support Through Donations</h2>

        <div className="row align-items-center g-4">
          <div className="col-md-6">
            <h4 className="fw-semibold">Help build a better campus.</h4>
            <p className="text-muted">
              Your contribution supports scholarships, events, and student welfare activities.
            </p>
            <button
              className="btn btn-danger"
              onClick={() => navigate("/donations")}
            >
              Donate Now →
            </button>
          </div>

          <div className="col-md-6">
            <img
              src="https://images.unsplash.com/photo-1516979187457-637abb4f9353"
              className="img-fluid rounded shadow"
              alt="Donations"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 bg-dark text-white mt-5">
        <p className="mb-0">© {new Date().getFullYear()} Alumni Connect | All Rights Reserved</p>
      </footer>

      {/* Styles */}
      <style jsx>{`
        .home-container {
          overflow-x: hidden;
        }

        .hero-section {
          background: linear-gradient(135deg, #0d0f23 0%, #2c0f49 100%);
          min-height: 80vh;
          padding: 0 2rem;
        }

        .achievements-section {
          background: #f8f9fa;
          margin: 0 -2rem;
          padding: 0 2rem;
        }

       .achievements-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  justify-items: center; /* centers cards when odd */
}


        .achievement-card {
          background: white;
          border-radius: 16px;
          overflow: visible; /* Changed from hidden to visible */
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .achievement-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
        }

      .achievement-image-container {
  width: 100%;
  height: 250px; /* fixed height so all cards look uniform */
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  overflow: hidden;
  border-radius: 16px 16px 0 0;
}

.achievement-image {
  width: 100%;
  height: 100%;
  object-fit: contain;  /* full image always visible */
  object-position: center;
  background: #fff;
}

        .achievement-card:hover .achievement-image {
          transform: scale(1.05);
        }

        .achievement-content {
          padding: 1.5rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .achievement-description {
          font-size: 1.1rem;
          color: #333;
          line-height: 1.6;
          margin-bottom: 1rem;
          font-weight: 500;
          flex-grow: 1;
        }

        .achievement-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          margin-top: auto;
        }

        /* Ensure images are fully visible and not cropped */
        .achievement-image-container img {
          max-width: 100%;
          max-height: 100%;
          width: auto;
          height: auto;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-section {
            min-height: 60vh;
            padding: 0 1rem;
          }

          .achievements-section {
            margin: 0 -1rem;
            padding: 0 1rem;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .achievement-image-container {
            height: 200px;
          }

          .achievement-content {
            padding: 1.25rem;
          }

          .achievement-description {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .achievements-grid {
            grid-template-columns: 1fr;
          }

          .achievement-card {
            margin: 0 0.5rem;
          }

          .achievement-image-container {
            height: 180px;
          }
        }

        /* Additional fixes for image visibility */
        .achievement-image {
          object-position: center center; /* Center the image */
        }

        /* Ensure the image container doesn't crop the image */
        .achievement-image-container {
          background: transparent;
        }
      `}</style>
    </div>
  );
}