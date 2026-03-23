import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';

import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashBoard";
import CompanyDashboard from "./pages/CompanyDashboard";
import JobBoard from "./pages/JobBoard";
import Profile from "./pages/Profile";
import StudentProfile from "./pages/StudentProfile";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

import { NotificationProvider } from "./context/NotificationContext";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <NotificationProvider>
      <ThemeProvider>
        <Router>
        <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/home" element={<Home />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Old login/register pages disabled — replaced by modal popups on the Home page */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        <Route path="/register" element={<Navigate to="/" replace />} />



        <Route path="/student-dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />

        <Route path="/student-profile" element={<ProtectedRoute role="student"><StudentProfile /></ProtectedRoute>} />

        <Route path="/admin-dashboard/*" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />

        <Route path="/company-dashboard" element={<ProtectedRoute role="company"><CompanyDashboard /></ProtectedRoute>} />

        <Route path="/jobs" element={<ProtectedRoute><JobBoard /></ProtectedRoute>} />

        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      </Routes>
      </Router>
      </ThemeProvider>
    </NotificationProvider>
    </GoogleOAuthProvider>
  );
}

export default App;