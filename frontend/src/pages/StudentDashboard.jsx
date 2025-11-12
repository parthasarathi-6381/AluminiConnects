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
            <div className="profile-title">{profile?.department}  Year:{profile?.yearOfStudy}</div>
          </div>
          
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

       
      </main>

     
    </div>
  )
}