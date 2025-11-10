import React, { useState } from 'react'
import { db, storage } from '../firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useAuth } from './AuthProvider'

export default function CreatePost({ role='student', onPosted }){
  const [text, setText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const { currentUser, profile } = useAuth()

  const submit = async (e)=>{
    e.preventDefault()
    setLoading(true)
    try{
      let mediaUrl = ''
      if(file){
        const storageRef = ref(storage, `posts/${Date.now()}_${file.name}`)
        await uploadBytes(storageRef, file)
        mediaUrl = await getDownloadURL(storageRef)
      }
      const post = {
        authorId: currentUser.uid,
        authorEmail: currentUser.email,
        role,
        text,
        media: mediaUrl,
        createdAt: new Date().toISOString()
      }
      const res = await addDoc(collection(db,'posts'), post)
      onPosted && onPosted({id:res.id, ...post})
      setText('')
      setFile(null)
    }catch(err){
      console.error(err)
      alert('Failed to post: '+err.message)
    }
    setLoading(false)
  }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:46,height:46,borderRadius:46,background:'#c7e2ff',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--royal)',fontWeight:700}}>
          {currentUser?.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <form onSubmit={submit} style={{flex:1}}>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Start a post" style={{width:'100%',minHeight:72,borderRadius:8,padding:10,border:'1px solid #e6e9ef'}} />
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
            <div style={{display:'flex',gap:8}}>
              <label className="btn secondary small" style={{display:'inline-flex',alignItems:'center',gap:6,cursor:'pointer'}}>
                <span style={{width:10,height:10,background:'#34d399',borderRadius:4,display:'inline-block'}}></span> Photo
                <input type="file" style={{display:'none'}} onChange={e=>setFile(e.target.files[0])} />
              </label>
              <button type="button" className="btn secondary small">Video</button>
              <button type="button" className="btn secondary small">Write article</button>
            </div>
            <div>
              <button type="submit" className="btn">Post</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
