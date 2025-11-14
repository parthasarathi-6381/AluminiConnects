import React, { useState, useEffect } from 'react';
import { getAuth } from "firebase/auth";
import './Discussion.css';

const Discussion = () => {
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [userRole, setUserRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'];

  

  // Fetch user info
  useEffect(() => {
  const role = localStorage.getItem('userRole') || 'student';
  const userId = localStorage.getItem('userId') || '';
  setUserRole(role);
  setCurrentUserId(userId);
  
}, []);


  // Fetch discussions by department
  useEffect(() => {
    fetchDiscussions();
  }, [selectedDept]);

  const fetchDiscussions = async () => {
    setLoading(true);
    setError('');
    try {
      const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/discussion/${selectedDept}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discussions');
      }
      
      const data = await response.json();
      setDiscussions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
       const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/discussion/${selectedDept}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newPost,
          authorId: currentUserId
        })
      });
       

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create post');
      }
      
      setNewPost({ title: '', content: '' });
      setShowCreateForm(false);
      fetchDiscussions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLikePost = async (postId) => {
    try {
       const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/discussion/post/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update like');
      }
      
      fetchDiscussions();
      if (selectedPost && selectedPost._id === postId) {
        fetchSinglePost(postId);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const fetchSinglePost = async (postId) => {
    try {
       const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/discussion/post/${postId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch post');
      }
      
      const data = await response.json();
      setSelectedPost(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
       const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/discussion/post/${selectedPost._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: newComment , authorId: currentUserId})
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }
      
      setNewComment('');
      fetchSinglePost(selectedPost._id);
      fetchDiscussions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
       const auth = getAuth();
      const token = await auth.currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/discussion/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete post');
      }
      
      setSelectedPost(null);
      fetchDiscussions();
    } catch (err) {
      setError(err.message);
    }
  };

  const openPost = (post) => {
    setSelectedPost(post);
    fetchSinglePost(post._id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const isPostLiked = (post) => {
    return post.likes && Array.isArray(post.likes) && post.likes.includes(currentUserId);
  };

  return (
    <div className="discussion-page">
      <div className="discussion-container">
        {/* Header */}
        <div className="discussion-header">
          <h1>Department Discussions</h1>
          <button 
            className="create-post-btn"
            onClick={() => setShowCreateForm(true)}
          >
            + New Discussion
          </button>
        </div>

        {/* Department Tabs */}
        <div className="department-tabs">
          {departments.map(dept => (
            <button
              key={dept}
              className={`dept-tab ${selectedDept === dept ? 'active' : ''}`}
              onClick={() => {
                setSelectedDept(dept);
                setSelectedPost(null);
              }}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Main Content */}
        <div className="discussion-content">
          {/* Posts List */}
          <div className="posts-list">
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading discussions...</p>
              </div>
            ) : discussions.length === 0 ? (
              <div className="no-posts">
                <p>No discussions yet in {selectedDept} department.</p>
                <p>Be the first to start a discussion!</p>
              </div>
            ) : (
              discussions.map(post => (
                <div 
                  key={post._id} 
                  className={`post-card ${selectedPost?._id === post._id ? 'active' : ''}`}
                  onClick={() => openPost(post)}
                >
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar">
                        {post.authorName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="author-info">
                        <span className="author-name">{post.authorName || 'Anonymous'}</span>
                        <span className="post-time">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-preview">
                    {post.content.length > 150 ? `${post.content.substring(0, 150)}...` : post.content}
                  </p>
                  
                  <div className="post-stats">
                    <span className="stat">
                      ♥ {post.likes?.length || 0} likes
                    </span>
                    <span className="stat">
                      💬 {post.comments?.length || 0} comments
                    </span>
                  </div>
                 
                    {(userRole === 'admin' || post.authorId === currentUserId) && (
                        <button 
                          className="delete-btn small-delete"
                          onClick={(e) => {
                             e.stopPropagation();
                             handleDeletePost(post._id);
                          }}
                         >
                 🗑
                      </button>
                  )}

                </div>
              ))
            )}
            
          </div>

          {/* Post Detail View */}
          {selectedPost && (
            <div className="post-detail">
              <div className="detail-header">
                <button 
                  className="close-btn"
                  onClick={() => setSelectedPost(null)}
                >
                  ← Back
                </button>
                {(userRole === 'admin' || selectedPost.authorId === currentUserId) && (
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeletePost(selectedPost._id)}
                  >
                    Delete Post
                  </button>
                )}
              </div>

              <div className="detail-content">
                <div className="detail-author">
                  <div className="author-avatar large">
                    {selectedPost.authorName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="author-info">
                    <span className="author-name">{selectedPost.authorName || 'Anonymous'}</span>
                    <span className="post-time">{formatDate(selectedPost.createdAt)}</span>
                  </div>
                </div>

                <h2 className="detail-title">{selectedPost.title}</h2>
                <p className="detail-text">{selectedPost.content}</p>

                <div className="post-actions">
                  <button 
                    className={`like-btn ${isPostLiked(selectedPost) ? 'liked' : ''}`}
                    onClick={() => handleLikePost(selectedPost._id)}
                  >
                    ♥ {selectedPost.likes?.length || 0} Likes
                  </button>
                </div>

                {/* Comments Section */}
                <div className="comments-section">
                  <h3>Comments ({selectedPost.comments?.length || 0})</h3>
                  
                  <form className="comment-form" onSubmit={handleAddComment}>
                    <textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows="3"
                    />
                    <button type="submit">Post Comment</button>
                  </form>

                  <div className="comments-list">
                    {selectedPost.comments && selectedPost.comments.length > 0 ? (
                      selectedPost.comments.map((comment, index) => (
                        <div key={index} className="comment">
                          <div className="comment-avatar">
                            {comment.authorName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="comment-author">{comment.authorName || 'Anonymous'}</span>
                              <span className="comment-time">{formatDate(comment.createdAt)}</span>
                            </div>
                            <p className="comment-text">{comment.content}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-comments">No comments yet. Be the first to comment!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create Post Modal */}
        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Create New Discussion</h2>
                <button 
                  className="modal-close"
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleCreatePost}>
                <div className="form-group">
                  <label>Department</label>
                  <input 
                    type="text" 
                    value={selectedDept} 
                    disabled 
                    className="dept-display"
                  />
                </div>

                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    placeholder="Enter discussion title..."
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Content</label>
                  <textarea
                    placeholder="Share your thoughts, questions, or insights..."
                    value={newPost.content}
                    onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                    rows="6"
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    Create Discussion
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Discussion;