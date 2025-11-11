import React, { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import CreatePost from '../components/CreatePost'
import PostFeed from '../components/PostFeed'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebase'

export default function AlumniDashboard(){
  const { currentUser, profile } = useAuth()
  const [posts, setPosts] = useState([])

  useEffect(()=>{
    async function load(){
      const p = await getDocs(collection(db,'posts'))
      setPosts(p.docs.map(d=>({id:d.id, ...d.data()})).filter(x=>!x.deleted))
    }
    load()
  },[])

  const onNewPost = (post)=> setPosts([post, ...posts])

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
            <div className="profile-name">{profile?.name || 'Alumni User'}</div>
            <div className="profile-title">{profile?.dept} • Batch {profile?.batch}</div>
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

          <div style={{marginTop: 16, textAlign: 'center'}}>
            {profile?.verified ? (
              <div className="verification-badge">
                <span>✓ Verified Alumni</span>
              </div>
            ) : (
              <div className="verification-badge unverified">
                <span>● Unverified</span>
              </div>
            )}
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
          <h2>Alumni Dashboard</h2>
          <div className="muted">Welcome back, {profile?.name || 'Alumni'}</div>
        </div>

        <div className="card" style={{marginBottom: 16}}>
          <CreatePost role="alumni" onPosted={onNewPost} />
        </div>

        <div className="card">
          <h3>Feed</h3>
          <PostFeed posts={posts} />
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="rightcol">
        <div className="card">
          <h4>Meeting Requests</h4>
          <p className="muted">Submit meeting links via the Meeting request UI (prototype).</p>
        </div>
        
        <div className="card">
          <h4>Events</h4>
          <div className="muted">No upcoming events.</div>
        </div>
        
        <div className="card">
          <h4>LinkedIn News</h4>
          <div style={{marginTop: 12}}>
            <div style={{padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)'}}>
              <div className="muted" style={{fontSize: '0.85rem'}}>Startups eye more freshers</div>
              <div className="muted" style={{fontSize: '0.75rem'}}>4h ago • 58 readers</div>
            </div>
            <div style={{padding: '8px 0'}}>
              <div className="muted" style={{fontSize: '0.85rem'}}>Salon chains face tech heat</div>
              <div className="muted" style={{fontSize: '0.75rem'}}>8h ago • 74 readers</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}