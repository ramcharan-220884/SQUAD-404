import React, { createContext, useContext, useState, useEffect } from 'react';
import { authFetch } from '../services/api';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // We should fetch the user's theme once on app load/login
  useEffect(() => {
    const fetchUserTheme = async () => {
      try {
        const res = await authFetch('/auth/me');
        const json = await res.json();

        if (json.success && json.user) {
          const isDark = json.user.darkMode;
          setDarkMode(isDark);
        } else {
          setDarkMode(false);
        }
      } catch (err) {
        console.error("Failed to fetch user theme:", err);
        setDarkMode(false);
      } finally {
        setIsInitializing(false);
      }
    };

    fetchUserTheme();

    // Listen to potential storage events if user logs out in another tab
    window.addEventListener('storage', fetchUserTheme);
    return () => window.removeEventListener('storage', fetchUserTheme);
  }, []);

  const toggleTheme = async () => {
    const newVal = !darkMode;
    
    // Optimistic UI update
    setDarkMode(newVal);

    try {
      await authFetch('/auth/theme', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ darkMode: newVal })
      });
    } catch (err) {
      console.error("Failed to persist theme preference:", err);
      // Optional: rollback on error
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme, isInitializing }}>
      {children}
    </ThemeContext.Provider>
  );
};
