import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashBoard";
import CompanyDashboard from "./pages/CompanyDashboard";
import JobBoard from "./pages/JobBoard";
import Profile from "./pages/Profile";
import StudentProfile from "./pages/StudentProfile";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/home" element={<Home />} />

        {/* Old login/register pages disabled — replaced by modal popups on the Home page */}
        <Route path="/login" element={<Navigate to="/" replace />} />

        <Route path="/register" element={<Navigate to="/" replace />} />

        <Route path="/student-dashboard" element={<StudentDashboard />} />

        <Route path="/admin-dashboard/*" element={<AdminDashboard />} />

        <Route path="/company-dashboard" element={<CompanyDashboard />} />

        <Route path="/jobs" element={<JobBoard />} />

        <Route path="/profile" element={<Profile />} />

        <Route path="/student-profile" element={<StudentProfile />} />

      </Routes>
    </Router>
  );
}

export default App;