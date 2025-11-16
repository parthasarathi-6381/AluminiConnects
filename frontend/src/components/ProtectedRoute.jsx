// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function ProtectedRoute({ role, children }) {
  const { currentUser, profile } = useAuth();

  // Not logged in → redirect
  if (!currentUser || !profile) return <Navigate to="/login" replace />;

  // If a role or list of roles is provided → validate
  if (role) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    if (!allowedRoles.includes(profile.role)) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}
