import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authFetch } from "../services/api";

const ProtectedRoute = ({ children, role }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await authFetch('/auth/me', {
          method: "GET"
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setIsAuthenticated(true);
          setUserRole(data.user.role);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If a specific role is required and user role doesn't match
  if (role && userRole !== role) {
    // Redirect logic strictly preventing cross-dashboard access
    if (userRole === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (userRole === "company") return <Navigate to="/company-dashboard" replace />;
    return <Navigate to="/student-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
