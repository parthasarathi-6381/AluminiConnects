import React, { useState } from 'react'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'

export default function Signup(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [extra, setExtra] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      const res = await createUserWithEmailAndPassword(auth, email, password)
      const user = res.user
      await sendEmailVerification(user)
      // store profile in backend (Node/Express -> MongoDB)
      // Backend expected endpoint: POST /api/users
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'
      const profile = {
        uid: user.uid,
        email,
        role,
        verified: role==='alumni' ? false : true,
        createdAt: new Date().toISOString(),
        ...extra
      }
      try{
        await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profile)
        })
      }catch(err){
        console.error('failed to save profile to backend', err)
      }
      alert('Account created. Verification email sent. Please verify your email before logging in.')
      navigate('/login')
    }catch(err){
      console.error(err)
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create account</h2>
        <p className="lead muted">Sign up as Student, Alumni or Admin. Verify your email after signup.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>

          <div className="form-row">
            <label>Role</label>
            <select value={role} onChange={e=>setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role==='alumni' && (
            <>
              <div className="form-row">
                <label>Batch</label>
                <input onChange={e=>setExtra({...extra, batch:e.target.value})} />
              </div>
              <div className="form-row">
                <label>Department</label>
                <input onChange={e=>setExtra({...extra, dept:e.target.value})} />
              </div>
            </>
          )}

          {role==='student' && (
            <>
              <div className="form-row">
                <label>Register Number</label>
                <input onChange={e=>setExtra({...extra, regNo:e.target.value})} />
              </div>
              <div className="form-row">
                <label>Department</label>
                <input onChange={e=>setExtra({...extra, dept:e.target.value})} />
              </div>
            </>
          )}

          <div className="form-row">
            <button type="submit" className="btn" disabled={loading}>Create account</button>
          </div>
          {error && <div style={{color:'red'}} className="small">{error}</div>}
        </form>

        <div className="center small" style={{marginTop:12}}>
          <div className="muted">Already have an account? <a href="/login">Login</a></div>
        </div>

        <p className="small muted" style={{marginTop:18}}>Note: This prototype uses Firebase Email verification. Admins will have to approve alumni in the Admin dashboard.</p>
      </div>
    </div>
  )
}
