// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";

import Home from "./pages/Home";
import Events from "./pages/Events";
import Donations from "./pages/Donations";
import Jobs from "./pages/Jobs";
import Discussion from "./pages/Discussion";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./components/AuthProvider";

import AdminLayout from "./pages/AdminLayout";
import AdminDashboardHome from "./pages/AdminDashboardHome";
import CreateEvent from "./pages/CreateEvent";
import ManageStudents from "./pages/ManageStudents";
import ManageAlumni from "./pages/ManageAlumni";
import EventsDashboard from "./pages/Events";

import AlumniDashboard from "./pages/AlumniDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import CompleteProfile from "./pages/CompleteProfile";
import AdminJobs from "./pages/AdminJobs";

export default function App() {
  const { profile, currentUser } = useAuth();
  const location = useLocation();

  // Paths where navbar should NOT appear
  const hideNavbarPaths = ["/login", "/signup", "/forgot-password"];

  // Navbar shows only when user is logged in + not on auth pages
  const shouldShowNavbar =
    currentUser && !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* Protected Home */}
        <Route
          path="/home"
          element={
            <ProtectedRoute role={["student", "alumni", "clubMember", "admin"]}>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Public pages */}
        <Route path="/events" element={<Events />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/discussions" element={<Discussion />} />

        {/* Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardHome />} />
          <Route path="create-event" element={<CreateEvent />} />
          <Route path="jobs" element={<AdminJobs />} />
          <Route path="students" element={<ManageStudents />} />
          <Route path="alumni" element={<ManageAlumni />} />
          <Route path="events" element={<EventsDashboard />} />
        </Route>

        {/* Alumni */}
        <Route
          path="/alumni"
          element={
            <ProtectedRoute role="alumni">
              <AlumniDashboard />
            </ProtectedRoute>
          }
        />

        {/* Students + Club Members */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role={["student", "clubMember"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
