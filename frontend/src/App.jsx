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

import Messages from "./pages/Messages.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  const { profile } = useAuth();
  const location = useLocation();

  const hideNavbarPaths = ["/login", "/signup", "/forgot-password"];
  const shouldShowNavbar =
    profile && !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/complete-profile" element={<CompleteProfile />} />

        {/* Public pages */}
        <Route path="/home" element={<Home />} />
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

        {/* Students */}
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
/>

        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}
