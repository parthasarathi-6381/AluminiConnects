import React, { useEffect, useState } from 'react'
import { useAuth } from '../components/AuthProvider'
import { db } from '../firebase'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import PostFeed from '../components/PostFeed'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export default function AdminDashboard(){
  const { currentUser } = useAuth()
  const [alumni, setAlumni] = useState([])
  const [posts, setPosts] = useState([])

  useEffect(()=>{
    async function load(){
      // fetch alumni from backend (MongoDB)
      try{
        const res = await fetch(`${API_BASE}/api/users?role=alumni`)
        if(res.ok){
          const data = await res.json()
          // backend expected to return array of users with _id or id
          setAlumni(data.map(u=>({ id: u._id || u.id, ...u })))
        }else{
          setAlumni([])
        }
      }catch(err){
        console.error('fetch alumni from backend', err)
        setAlumni([])
      }

      const p = await getDocs(collection(db,'posts'))
      setPosts(p.docs.map(d=>({id:d.id, ...d.data()})))

      // fetch meetings from backend
      try{
        const mr = await fetch(`${API_BASE}/api/meetings`)
        if(mr.ok){
          const meetings = await mr.json()
          // For now we don't display them in detail in this prototype; you can extend UI.
          console.log('meetings from backend', meetings)
        }
      }catch(e){
        console.error('fetch meetings', e)
      }
    }
    load()
  },[])

  const verify = async (id)=>{
    // Call backend to mark verified in MongoDB
    try{
      await fetch(`${API_BASE}/api/users/${id}/verify`, { method: 'PATCH' })
      setAlumni(alumni.map(a=> a.id===id ? {...a, verified:true} : a))
    }catch(err){
      console.error('verify user via backend', err)
      alert('Failed to verify user on backend')
    }
  }

  const deletePost = async (id)=>{
    // For prototype, just mark deleted flag
    await updateDoc(doc(db,'posts',id), { deleted:true })
    setPosts(posts.map(p=> p.id===id ? {...p, deleted:true} : p))
  }

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="card">
          <h4>Admin</h4>
          <div className="muted">Manage alumni, posts, meetings and donations</div>
        </div>

        <div className="card">
          <h4 className="small">Quick actions</h4>
          <div style={{marginTop:8}}>
            <button className="btn small">View Donations</button>
          </div>
        </div>
      </aside>

      <main className="content">
        <div className="section-title">
          <h2>Admin Dashboard</h2>
          <div className="small muted">Signed in: {currentUser?.email}</div>
        </div>

        <div className="stats" style={{marginTop:12}}>
          <div className="stat card">
            <h4>{alumni.filter(a=>!a.verified).length}</h4>
            <div className="muted">Unverified alumni</div>
          </div>
          <div className="stat card">
            <h4>{posts.length}</h4>
            <div className="muted">Total posts</div>
          </div>
        </div>

        <div className="card" style={{marginTop:12}}>
          <h3>Unverified Alumni</h3>
          {alumni.filter(a=>!a.verified).length===0 && <div className="muted">No unverified alumni</div>}
          <ul>
            {alumni.filter(a=>!a.verified).map(a=> (
              <li key={a.id} style={{marginBottom:8}}>
                <strong>{a.email}</strong> <span className="muted">{a.batch} • {a.dept}</span>
                <div style={{marginTop:6}}><button className="btn small" onClick={()=>verify(a.id)}>Verify</button></div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card">
          <div className="section-title">
            <h3>All Posts</h3>
          </div>
          <PostFeed posts={posts} onDelete={deletePost} adminView />
        </div>

        <div className="card">
          <h3>Meetings</h3>
          <p className="muted">Meeting requests are available via the backend. Extend this UI to approve/disapprove.</p>
        </div>
      </main>

      <aside className="rightcol">
        <div className="card">
          <h4>LinkedIn News</h4>
          <ul className="muted">
            <li>Apple preps satellite features</li>
            <li>Wedding season lift jewel stocks</li>
            <li>India Inc revenue drops</li>
          </ul>
        </div>

        <div className="card">
          <h4>Events</h4>
          <div className="muted">No upcoming events. Admin can create events from the backend.</div>
        </div>
      </aside>
    </div>
  )
}
