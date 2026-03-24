import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import socketService from "../services/socketService";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileCheck,
  Settings as SettingsIcon,
  HelpCircle,
  UserPlus,
  Building,
  CheckCircle,
  XCircle,
  Megaphone,
  Trophy,
  Mic,
  MessageSquare,
  LogOut
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";

import StudentManagement from "../components/dashboard/StudentManagement";
import CompanyManagement from "../components/dashboard/CompanyManagement";
import Announcements from "../components/dashboard/Announcements";
import Settings from "../components/dashboard/Settings";
import HelpSupport from "../components/dashboard/HelpSupport";
import ThemeToggle from "../components/dashboard/ThemeToggle";
import Competitions from "../components/dashboard/Competitions";
import Events from "../components/dashboard/Events";
import Assessments from "../components/dashboard/Assessments";
import Interviews from "../components/dashboard/Interviews";
import CandidateCommunication from "../components/dashboard/CandidateCommunication";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

import {
  getStats,
  getPendingUsers,
  approveUser,
  rejectUser,
  getPlacementAnalytics
} from "../services/adminService";

const PIE_COLORS = ["#16a34a", "#facc15", "#dc2626"];

// LocalStorage helpers
const LS_RES_PENDING = "pendingResources";
const LS_RES_APPROVED = "approvedResources";

const getAdminResPending = () =>
  JSON.parse(localStorage.getItem(LS_RES_PENDING)) || [];

const getAdminResApproved = () =>
  JSON.parse(localStorage.getItem(LS_RES_APPROVED)) || [];

const setAdminResPending = (arr) =>
  localStorage.setItem(LS_RES_PENDING, JSON.stringify(arr));

const setAdminResApproved = (arr) =>
  localStorage.setItem(LS_RES_APPROVED, JSON.stringify(arr));

export default function AdminDashboard() {
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [placementAnalytics, setPlacementAnalytics] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingResources, setPendingResources] = useState(getAdminResPending());

  // ✅ ADMIN1 LOGOUT (FINAL)
  const handleConfirmLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    sessionStorage.clear();
    socketService.disconnect();
    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, pendingData, analyticsData] = await Promise.all([
        getStats(),
        getPendingUsers(),
        getPlacementAnalytics().catch(() => [])
      ]);

      setStats(statsData);
      setPlacementAnalytics(analyticsData);

      setPendingStudents(
        pendingData.filter((u) => u.type === "student")
      );
      setPendingRecruiters(
        pendingData.filter((u) => u.type === "company")
      );
    } catch (err) {
      showNotification(
        `Failed to fetch dashboard data: ${err.message}`,
        "error",
        "admin"
      );
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) socketService.connect(token);

    const searchParams = new URLSearchParams(location.search);
    const scrollTarget = searchParams.get("scroll");

    if (scrollTarget === "analytics") {
      document
        .getElementById("analytics-section")
        ?.scrollIntoView({ behavior: "smooth" });
    } else if (scrollTarget === "top") {
      document
        .getElementById("dashboard-top")
        ?.scrollIntoView({ behavior: "smooth" });
    }

    fetchData();

    const syncResources = () =>
      setPendingResources(getAdminResPending());

    window.addEventListener("storage", syncResources);

    return () =>
      window.removeEventListener("storage", syncResources);
  }, [fetchData, location]);

  const approveResource = (id) => {
    const pending = getAdminResPending();
    const res = pending.find((r) => r.id === id);
    if (!res) return;

    const newPending = pending.filter((r) => r.id !== id);
    const newApproved = [
      ...getAdminResApproved(),
      { ...res, status: "approved" }
    ];

    setAdminResPending(newPending);
    setAdminResApproved(newApproved);
    setPendingResources(newPending);

    showNotification(
      "Resource approved — now visible to students!",
      "success",
      "admin"
    );
  };

  const rejectResource = (id) => {
    const newPending = getAdminResPending().filter(
      (r) => r.id !== id
    );
    setAdminResPending(newPending);
    setPendingResources(newPending);

    showNotification("Resource rejected.", "error", "admin");
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-green-50 hidden md:flex flex-col">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">
            EDUVATE
          </h1>
          <p className="text-xs text-green-300">
            Admin Portal
          </p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link to="/admin-dashboard" className="flex gap-2">
            <LayoutDashboard size={18} /> Home
          </Link>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex gap-2 text-red-300"
          >
            <LogOut size={18} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">
        <h2 className="text-3xl font-bold">
          Overview Dashboard
        </h2>
      </main>

      {/* ✅ ADMIN1 LOGOUT MODAL UI */}
      {showLogoutConfirm && (
        <div className="db-logout-modal-overlay">
          <div className="db-logout-modal">
            <div className="db-logout-modal-icon">
              <LogOut size={28} />
            </div>
            <h3>Log Out</h3>
            <p>Are you sure you want to log out?</p>
            <div className="db-logout-modal-actions">
              <button
                className="db-btn-cancel"
                onClick={handleCancelLogout}
              >
                Cancel
              </button>
              <button
                className="db-btn-confirm"
                onClick={handleConfirmLogout}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}