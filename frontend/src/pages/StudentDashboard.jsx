import React, { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import PostFeed from '../components/PostFeed'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

export default function StudentDashboard(){
  const { profile } = useAuth()
  const [posts, setPosts] = useState([])

  useEffect(()=>{
    async function load(){
      const p = await getDocs(collection(db,'posts'))
      setPosts(p.docs.map(d=>({id:d.id, ...d.data()})).filter(x=>!x.deleted))
    }
    load()
  },[])

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="dashboard">
      {/* Left Sidebar - Profile */}
      <aside className="sidebar">
        <div className="card">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitials(profile?.name || profile?.email)}
            </div>
            <div className="profile-name">{profile?.name || 'Student User'}</div>
            <div className="profile-title">{profile?.dept} • Year {profile?.yearOfStudy}</div>
            <div className="profile-location">
              <span>📍 Chennai, Tamil Nadu</span>
            </div>
          </div>
          
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Profile Views</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">0</span>
              <span className="stat-label">Connections</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h4>People you may know</h4>
          <div className="muted">Connect with alumni and students.</div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="content">
        <div className="section-title">
          <h2>Student Dashboard</h2>
          <div className="muted">Welcome {profile?.name || profile?.email}</div>
        </div>

        <div className="card" style={{marginBottom: 16}}>
          <PostFeed posts={posts} />
        </div>

        <div className="card">
          <h3>Donations</h3>
          <p className="muted">Students can also donate using Razorpay test flow.</p>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="rightcol">
        <div className="card">
          <h4>Events</h4>
          <div className="muted">No upcoming events.</div>
        </div>
        
        <div className="card">
          <h4>Resources</h4>
          <div className="muted">Study materials and career resources.</div>
        </div>
      </aside>
    </div>
  )
}