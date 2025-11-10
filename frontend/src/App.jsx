import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import AlumniDashboard from './pages/AlumniDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App(){
  return (
    <div>
      <header className="topbar">
        <div className="brand">CIT AlConn</div>
        <div>
          <Link to="/">Home</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Sign up</Link>
        </div>
      </header>
      <Routes>
        <Route path="/signup" element={<Signup/>} />
        <Route path="/login" element={<Login/>} />

        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard/></ProtectedRoute>} />
        <Route path="/alumni" element={<ProtectedRoute role="alumni"><AlumniDashboard/></ProtectedRoute>} />
        <Route path="/student" element={<ProtectedRoute role="student"><StudentDashboard/></ProtectedRoute>} />

        <Route path="/" element={<div style={{padding:20}}>Welcome to CIT AlConn. Use the links above to login or signup.</div>} />
      </Routes>
    </div>
  )
}
