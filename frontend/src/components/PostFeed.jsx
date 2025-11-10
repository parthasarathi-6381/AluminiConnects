import React from 'react'

export default function PostFeed({ posts=[], onDelete, adminView }){
  return (
    <div>
      {posts.length===0 && <div className="muted">No posts yet</div>}
      {posts.map(p=> (
        <div key={p.id} className={`post-card ${p.role==='alumni' ? 'alumni-post' : 'student-post'}`}>
          <div className="meta">{p.authorEmail || 'unknown'} • {p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
          <div className="text">{p.text}</div>
          {p.media && <div style={{marginTop:8}}><a href={p.media} target="_blank" rel="noreferrer">View media</a></div>}
          <div className="actions">
            {adminView && <button className="btn danger" onClick={()=>onDelete?.(p.id)}>Delete</button>}
          </div>
        </div>
      ))}
    </div>
  )
}
