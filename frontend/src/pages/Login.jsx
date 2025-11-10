import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../components/AuthProvider'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { profile } = useAuth()

  const handleSubmit = async (e)=>{
    e.preventDefault()
    setError('')
    try{
      const res = await signInWithEmailAndPassword(auth, email, password)
      const user = res.user
      if(!user.emailVerified){
        alert('Please verify your email before logging in.')
        return
      }
      // wait for profile to be loaded by AuthProvider then redirect by role
      setTimeout(()=>{
        if(profile?.role==='admin') navigate('/admin')
        else if(profile?.role==='alumni') navigate('/alumni')
        else navigate('/student')
      }, 600)
    }catch(err){
      setError(err.message)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Sign in to CIT AlConn</h2>
        <p className="lead muted">Access alumni, students and admin features.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>

          <div className="form-row">
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>

          <div className="form-row">
            <button type="submit" className="btn">Login</button>
          </div>
          {error && <div style={{color:'red'}} className="small">{error}</div>}
        </form>

        <div className="center small" style={{marginTop:12}}>
          <div className="muted">Don't have an account? <a href="/signup">Sign up</a></div>
        </div>
      </div>
    </div>
  )
}
