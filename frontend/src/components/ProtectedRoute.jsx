// src/components/ProtectedRoute.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthProvider'

export default function ProtectedRoute({ role, children }) {
  const { currentUser, profile } = useAuth()

  if (!currentUser || !profile) return <Navigate to="/login" />
  if (role && profile.role !== role) return <Navigate to="/login" />

  return children
}
