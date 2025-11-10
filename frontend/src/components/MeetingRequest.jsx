import React, { useState } from 'react'
import { useAuth } from './AuthProvider'

export default function MeetingRequest(){
  const [link, setLink] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const { currentUser } = useAuth()

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

  const submit = async (e)=>{
    e.preventDefault()
    try{
      await fetch(`${API_BASE}/api/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumniId: currentUser.uid,
          link, date, time,
          status: 'pending',
          createdAt: new Date().toISOString()
        })
      })
      alert('Meeting request submitted for admin approval')
      setLink(''); setDate(''); setTime('')
    }catch(err){
      console.error('submit meeting to backend', err)
      alert('Failed to submit meeting request')
    }
  }

  return (
    <form onSubmit={submit}>
      <input placeholder="Zoom/GMeet link" value={link} onChange={e=>setLink(e.target.value)} style={{width:'100%'}} required />
      <br/>
      <input type="date" value={date} onChange={e=>setDate(e.target.value)} required />
      <input type="time" value={time} onChange={e=>setTime(e.target.value)} required />
      <br/>
      <button type="submit">Request Meeting</button>
    </form>
  )
}
