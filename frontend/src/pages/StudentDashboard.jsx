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

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="card">
          <h4>{profile?.email}</h4>
          <div className="muted">{profile?.dept} • {profile?.yearOfStudy || ''}</div>
        </div>
      </aside>

      <main className="content">
        <div className="section-title">
          <h2>Student Dashboard</h2>
          <div className="muted">Welcome {profile?.email}</div>
        </div>

        <div className="card" style={{marginTop:12}}>
          <PostFeed posts={posts} />
        </div>

        <div className="card">
          <h3>Donations</h3>
          <p className="muted">Students can also donate using Razorpay test flow.</p>
        </div>
      </main>
    </div>
  )
}
