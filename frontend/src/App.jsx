// src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AlumniDashboard from './pages/AlumniDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './components/AuthProvider'
import  Home  from './pages/Home'
import Events from './pages/Events'
import Donations from './pages/Donations'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

export default function App() {
  return (
    <AuthProvider>
      
      <Routes>
        <Route path="/donations" element={<Donations/>}></Route>
        <Route path="/events" element={<Events/>}></Route>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
       
        <Route path="/home" element={<Home/>}/>
        
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/alumni" element={<ProtectedRoute role="alumni"><AlumniDashboard /></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
      </Routes>
     
    </AuthProvider>
  )
}
