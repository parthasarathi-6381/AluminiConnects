import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import CompleteProfile from "./pages/CompleteProfile.jsx";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AlumniDashboard from "./pages/AlumniDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Events from "./pages/Events";
import Donations from "./pages/Donations";
import Jobs from "./pages/Jobs";
import Discussion from "./pages/Discussion"
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ForgotPassword from "./pages/ForgotPassword";
import { useAuth } from "./components/AuthProvider";

import AdminLayout from "./pages/AdminLayout";
import AdminDashboardHome from "./pages/AdminDashboardHome";
import CreateEvent from "./pages/CreateEvent";

import ManageStudents from "./pages/ManageStudents";
import ManageAlumni from "./pages/ManageAlumni";
import EventsDashboard from "./pages/Events";


export default function App() {
  const { profile } = useAuth();
  const location = useLocation();

  // Hide navbar on login + signup pages
  const hideNavbarPaths = ["/login", "/signup","/forgot-password"];
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname) && profile;

  return (
    <>
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />


        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/Jobs" element={<Jobs/>}/>
        
        
        <Route path="/Discussions" element={<Discussion/>}/>


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

        <Route
          path="/alumni"
          element={
            <ProtectedRoute role="alumni">
              <AlumniDashboard />
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

      {/* Optional footer */}
      
      {/* <Footer /> */}
    </>
  );
}
