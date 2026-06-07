import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      async function fetchUser() {
        setLoading(true);

        try {
          const data = await apiFetch(
            `${import.meta.env.VITE_API_BASE_URL}/user/me`,
            { showToast: false }
          );

          if (data?.user) {
            setUser(data.user);
          } else {
            setUser(null); // not logged in, normal for first load
          }

        } catch (err) {
          // Keep 401/unauthenticated silent in console to avoid noisy dev output.
          if (err.status && err.status !== 401) {
            console.error("Auth error:", err);
          }
          setUser(null);
        } finally {
          setLoading(false);
        }
      }

      fetchUser();
    }, []);

  const login = (userData) => setUser(userData);
  const updateUser = (newData) => setUser(prev => (prev ? { ...prev, ...newData } : newData));

  const logout = async () => {
    await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/user/logout`, { method: 'GET', showToast: false });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 