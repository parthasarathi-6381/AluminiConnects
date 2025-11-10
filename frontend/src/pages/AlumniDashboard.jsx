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

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="card">
          <h4>{profile?.email}</h4>
          <div className="muted">{profile?.dept} • batch {profile?.batch}</div>
          <div style={{marginTop:10}}>{profile?.verified ? <span style={{color:'var(--success)'}}>Verified</span> : <span className="muted">Unverified</span>}</div>
        </div>
      </aside>

      <main className="content">
        <div className="section-title">
          <h2>Alumni Dashboard</h2>
          <div className="muted">Welcome back</div>
        </div>

        <div className="card" style={{marginTop:12}}>
          <CreatePost role="alumni" onPosted={onNewPost} />
        </div>

        <div className="card">
          <h3>Feed</h3>
          <PostFeed posts={posts} />
        </div>

        <div className="card">
          <h3>Meeting Requests</h3>
          <p className="muted">Submit meeting links via the Meeting request UI (prototype).</p>
        </div>
      </main>

      <aside className="rightcol">
        <div className="card">
          <h4>Events</h4>
          <div className="muted">No upcoming events.</div>
        </div>
        <div className="card">
          <h4>People you may know</h4>
          <div className="muted">Connect with alumni and students.</div>
        </div>
      </aside>
    </div>
  )
}
