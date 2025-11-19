// src/pages/AdminAchievements.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../components/AuthProvider";
import { getAuth } from "firebase/auth";

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [newAchievement, setNewAchievement] = useState({
    imageUrl: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  const { profile } = useAuth();

  useEffect(() => {
    loadAchievements(page);
  }, [page]);

  const loadAchievements = async (pageNum) => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/achievements?page=${pageNum}`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      // FIX: Ensure achievements is always an array
      const achievementsData = Array.isArray(data.achievements) ? data.achievements : [];
      const paginationData = data.pagination || {};
      
      setAchievements(achievementsData);
      setPagination(paginationData);
      setErrorMsg("");
    } catch (err) {
      console.error("Error fetching achievements:", err);
      setErrorMsg("Failed to load achievements. Please check if the server is running.");
      setAchievements([]); // Set to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    
    if (!newAchievement.imageUrl || !newAchievement.description) {
      setErrorMsg("Please fill in all fields");
      return;
    }

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch("http://localhost:5000/api/achievements", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newAchievement),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create achievement");
      }

      const createdAchievement = await res.json();
      
      setNewAchievement({
        imageUrl: "",
        description: "",
      });
      
      setSuccessMsg("Achievement created successfully!");
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 3000);
      
      // Reload achievements
      loadAchievements(page);
    } catch (err) {
      console.error("Error creating achievement:", err);
      setErrorMsg(err.message || "Failed to create achievement");
    }
  };

  const handleDelete = async (achievementId) => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) return;

    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();

      const res = await fetch(`http://localhost:5000/api/achievements/${achievementId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete achievement");
      }

      setSuccessMsg("Achievement deleted successfully!");
      setErrorMsg("");
      setTimeout(() => setSuccessMsg(""), 3000);
      
      // Reload achievements
      loadAchievements(page);
    } catch (err) {
      console.error("Error deleting achievement:", err);
      setErrorMsg("Failed to delete achievement");
    }
  };

  return (
    <div className="admin-achievements-container">
      <div className="header-section">
        <h2>Manage Achievements</h2>
        <div className="welcome-admin">
          <span>Welcome {profile?.name || 'Admin'}</span>
        </div>
      </div>

      {successMsg && (
        <div className="success-message">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="error-message">
          {errorMsg}
        </div>
      )}

      <div className="content-wrapper">
        {/* Create Achievement Form */}
        <div className="create-achievement-form">
          <h3>Create New Achievement</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="text"
                value={newAchievement.imageUrl}
                onChange={(e) => setNewAchievement({ ...newAchievement, imageUrl: e.target.value })}
                placeholder="https://example.com/achievement-image.jpg"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                placeholder="Describe the achievement..."
                rows="4"
                required
              />
            </div>

            <button type="submit" className="create-btn" disabled={loading}>
              {loading ? "Creating..." : "Create Achievement"}
            </button>
          </form>
        </div>

        {/* Achievements List */}
        <div className="achievements-list">
          <h3>Existing Achievements ({pagination.totalCount || 0})</h3>
          
          {loading && achievements.length === 0 ? (
            <div className="loading">Loading achievements...</div>
          ) : achievements.length === 0 ? (
            <p className="no-data">No achievements found.</p>
          ) : (
            <div className="achievements-grid">
              {achievements.map((achievement) => (
                <div key={achievement._id} className="achievement-card">
                  <div className="achievement-image">
                    <img 
                      src={achievement.imageUrl} 
                      alt="Achievement"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x250/2c0f49/ffffff?text=Image+Not+Found';
                      }}
                    />
                  </div>
                  <div className="achievement-details">
                    <p className="description">{achievement.description}</p>
                    <div className="meta-info">
                      <span>Posted by: {achievement.postedBy}</span>
                      <span>{new Date(achievement.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(achievement._id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => setPage(page - 1)} 
              disabled={page <= 1 || loading}
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {page} of {pagination.totalPages}
            </span>
            
            <button 
              onClick={() => setPage(page + 1)} 
              disabled={page >= pagination.totalPages || loading}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Built-in CSS */}
      <style jsx>{`
        .admin-achievements-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0d0f23 0%, #2c0f49 100%);
          color: white;
          padding: 0;
          margin: 0;
          width: calc(100% - 260px); /* Subtract sidebar width */
          margin-left: 260px; /* Push content right of sidebar */
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-section h2 {
          margin: 0;
          font-size: 2.5rem;
          background: linear-gradient(90deg, #b388ff, #ff6bff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
        }

        .welcome-admin {
          font-size: 1.1rem;
          color: rgba(255, 255, 255, 0.8);
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .content-wrapper {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          box-sizing: border-box;
        }

        .success-message {
          background: #d4edda;
          color: #155724;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          margin: 0 2rem 2rem 2rem;
          border: 1px solid #c3e6cb;
          text-align: center;
          font-weight: 500;
        }

        .error-message {
          background: #f8d7da;
          color: #721c24;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          margin: 0 2rem 2rem 2rem;
          border: 1px solid #f5c6cb;
          text-align: center;
          font-weight: 500;
        }

        .create-achievement-form {
          background: rgba(255, 255, 255, 0.05);
          padding: 2.5rem;
          border-radius: 20px;
          margin-bottom: 3rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(15px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          width: 100%;
          box-sizing: border-box;
        }

        .create-achievement-form h3 {
          color: white;
          margin-bottom: 2rem;
          font-size: 1.8rem;
          font-weight: 600;
          text-align: center;
        }

        .form-group {
          margin-bottom: 2rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.8rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.95);
          font-size: 1.1rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 1rem 1.2rem;
          background: rgba(0, 0, 0, 0.4);
          border: 2px solid rgba(255, 255, 255, 0.15);
          border-radius: 12px;
          font-size: 1rem;
          color: white;
          box-sizing: border-box;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #b388ff;
          box-shadow: 0 0 0 4px rgba(179, 136, 255, 0.15);
          background: rgba(0, 0, 0, 0.5);
        }

        .form-group input::placeholder,
        .form-group textarea::placeholder {
          color: rgba(255, 255, 255, 0.5);
          opacity: 1;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
          line-height: 1.5;
        }

        .create-btn {
          background: linear-gradient(135deg, #b388ff 0%, #ff6bff 100%);
          color: white;
          padding: 1.2rem 2rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
          margin-top: 1rem;
        }

        .create-btn:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(179, 136, 255, 0.4);
        }

        .create-btn:active:not(:disabled) {
          transform: translateY(-1px);
        }

        .create-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .achievements-list {
          width: 100%;
          box-sizing: border-box;
        }

        .achievements-list h3 {
          color: white;
          margin-bottom: 2rem;
          font-size: 1.8rem;
          font-weight: 600;
          text-align: center;
        }

        .loading {
          text-align: center;
          color: rgba(255, 255, 255, 0.7);
          padding: 4rem 2rem;
          font-size: 1.2rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .no-data {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          padding: 4rem 2rem;
          font-style: italic;
          font-size: 1.1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .achievements-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: 2.5rem;
          margin-bottom: 3rem;
          width: 100%;
          box-sizing: border-box;
        }

        .achievement-card {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.12);
          transition: all 0.4s ease;
          backdrop-filter: blur(15px);
          height: fit-content;
          box-sizing: border-box;
        }

        .achievement-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          border-color: rgba(179, 136, 255, 0.4);
        }

        .achievement-image {
          width: 100%;
          height: 250px;
          overflow: hidden;
          position: relative;
        }

        .achievement-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .achievement-card:hover .achievement-image img {
          transform: scale(1.08);
        }

        .achievement-details {
          padding: 2rem;
        }

        .description {
          color: white;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          font-size: 1.05rem;
          min-height: 80px;
          font-weight: 500;
        }

        .meta-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.7);
          padding-top: 1rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .meta-info span {
          display: block;
        }

        .delete-btn {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .delete-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(220, 53, 69, 0.3);
        }

        .delete-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1.5rem;
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pagination button {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          padding: 0.8rem 1.5rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .pagination button:hover:not(:disabled) {
          background: rgba(179, 136, 255, 0.2);
          border-color: #b388ff;
          transform: translateY(-2px);
        }

        .pagination button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none;
        }

        .page-info {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
          font-size: 1rem;
          padding: 0 1rem;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .achievements-grid {
            grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
            gap: 2rem;
          }
        }

        @media (max-width: 1024px) {
          .admin-achievements-container {
            width: calc(100% - 260px);
            margin-left: 260px;
          }
        }

        @media (max-width: 768px) {
          .admin-achievements-container {
            width: 100%;
            margin-left: 0;
            margin-top: 60px; /* Add space for mobile header */
          }

          .header-section {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            padding: 1.5rem 1rem 1rem 1rem;
          }

          .header-section h2 {
            font-size: 2rem;
          }

          .content-wrapper {
            padding: 1rem;
          }

          .create-achievement-form {
            padding: 2rem;
            margin-bottom: 2rem;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .achievement-card {
            margin: 0;
          }

          .pagination {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 480px) {
          .header-section h2 {
            font-size: 1.8rem;
          }

          .create-achievement-form {
            padding: 1.5rem;
          }

          .achievement-details {
            padding: 1.5rem;
          }

          .description {
            font-size: 1rem;
            min-height: 60px;
          }

          .achievements-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}