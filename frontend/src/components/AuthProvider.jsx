import React, { createContext, useContext, useEffect, useState } from 'react'
import { auth } from '../firebase'
import { onAuthStateChanged } from 'firebase/auth'

// API base for backend (Node/Express + MongoDB)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

// Note: profiles are stored in your backend (MongoDB). The backend must expose
// a GET /api/users/:uid endpoint that returns the profile JSON for the signed in user.
// Example response: { role: 'alumni', verified: false, email: 'a@b.com', ... }

const AuthContext = createContext()

export function useAuth(){
  return useContext(AuthContext)
}

export function AuthProvider({ children }){
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async (user)=>{
      setCurrentUser(user)
      if(user){
        try{
          const res = await fetch(`${API_BASE}/api/users/${user.uid}`)
          if(res.ok){
            const data = await res.json()
            setProfile(data)
          }else{
            // no profile available in backend
            setProfile(null)
          }
        }catch(e){
          console.error('fetch profile from backend', e)
          setProfile(null)
        }
      }else{
        setProfile(null)
      }
      setLoading(false)
    })
    return unsub
  },[])

  const value = { currentUser, profile, setProfile }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
