import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

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
                src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
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
    </div>
  );
}
