import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import JobBoard from "./pages/JobBoard";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/student-dashboard" element={<StudentDashboard />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />

        <Route path="/company-dashboard" element={<CompanyDashboard />} />

        <Route path="/jobs" element={<JobBoard />} />

        <Route path="/profile" element={<Profile />} />

      </Routes>
    </Router>
  );
}

export default App;