import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const token = await user.getIdToken();
          localStorage.setItem("authToken", token);

          // 🔥 UNIVERSAL PROFILE ROUTE (works for all roles)
          const res = await fetch(`${API_BASE}/api/users/${user.uid}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            const data = await res.json();
            setProfile(data);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error("Failed to fetch profile", err);
          setProfile(null);
        }
      } else {
        localStorage.removeItem("authToken");
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, profile, setProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
