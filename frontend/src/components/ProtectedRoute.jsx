import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute({ children, role }){
  const { currentUser, profile } = useAuth()
  if(!currentUser) return <Navigate to="/login" replace />
  if(role && profile && profile.role !== role) return <Navigate to="/login" replace />
  return children
}
