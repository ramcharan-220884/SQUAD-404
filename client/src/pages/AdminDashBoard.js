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
  LogOut,
  ChevronRight
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

// ── Sidebar nav config ──────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: "home",          label: "Dashboard",            icon: LayoutDashboard },
  { id: "students",      label: "Student Management",   icon: Users },
  { id: "companies",     label: "Company Management",   icon: Building },
  { id: "announcements", label: "Announcements",        icon: Megaphone },
  { id: "events",        label: "Campus Events",        icon: Calendar },
  { id: "competitions",  label: "Competitions",         icon: Trophy },
  { id: "assessments",   label: "Assessments",          icon: FileCheck },
  { id: "interviews",    label: "Interviews",           icon: Mic },
  { id: "communication", label: "Candidate Comms",      icon: MessageSquare },
  { id: "settings",      label: "Settings",             icon: SettingsIcon },
  { id: "help",          label: "Help & Support",       icon: HelpCircle },
];

export default function AdminDashboard() {
  const { showNotification } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("home");
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

  const handleApproveUser = async (id, type) => {
    try {
      await approveUser(id, type);
      showNotification(`${type === "student" ? "Student" : "Recruiter"} approved!`, "success", "admin");
      fetchData();
    } catch (err) {
      showNotification("Failed to approve user", "error", "admin");
    }
  };

  const handleRejectUser = async (id, type) => {
    try {
      await rejectUser(id, type);
      showNotification(`${type === "student" ? "Student" : "Recruiter"} rejected.`, "error", "admin");
      fetchData();
    } catch (err) {
      showNotification("Failed to reject user", "error", "admin");
    }
  };

  // ── Render main content based on active section ─────────────────────────
  const renderContent = () => {
    if (activeSection !== "home" && loading) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400 font-bold">
          Loading...
        </div>
      );
    }

    switch (activeSection) {
      case "students":
        return <StudentManagement />;
      case "companies":
        return <CompanyManagement />;
      case "announcements":
        return <Announcements role="admin" />;
      case "events":
        return <Events role="admin" />;
      case "competitions":
        return <Competitions role="admin" />;
      case "assessments":
        return <Assessments role="admin" />;
      case "interviews":
        return <Interviews role="admin" />;
      case "communication":
        return <CandidateCommunication />;
      case "settings":
        return <Settings />;
      case "help":
        return <HelpSupport />;
      default:
        return renderHomeDashboard();
    }
  };

  const renderHomeDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400 font-bold">
          Loading dashboard...
        </div>
      );
    }

    const statsCards = [
      { label: "Total Students", value: stats?.totalStudents ?? 0, color: "bg-blue-50 text-blue-700" },
      { label: "Total Companies", value: stats?.totalCompanies ?? 0, color: "bg-green-50 text-green-700" },
      { label: "Pending Approvals", value: (pendingStudents.length + pendingRecruiters.length), color: "bg-orange-50 text-orange-700" },
      { label: "Total Placements", value: stats?.totalPlacements ?? 0, color: "bg-purple-50 text-purple-700" },
    ];

    const pieData = [
      { name: "Placed", value: stats?.placedStudents ?? 0 },
      { name: "In Progress", value: stats?.inProgressStudents ?? 0 },
      { name: "Unplaced", value: stats?.unplacedStudents ?? 0 },
    ];

    return (
      <div id="dashboard-top" className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Overview Dashboard</h2>
          <p className="text-gray-500 mt-1 font-medium">Welcome back, Admin! Here's what's happening.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((card, i) => (
            <div key={i} className={`rounded-2xl p-6 shadow-sm border border-gray-100 ${card.color}`}>
              <p className="text-sm font-bold uppercase tracking-widest opacity-70">{card.label}</p>
              <h3 className="text-4xl font-black mt-2">{card.value}</h3>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div id="analytics-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Placement Analytics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={placementAnalytics.length > 0 ? placementAnalytics : [{ name: "No Data", value: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Student Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Students */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-green-600" />
                Pending Students ({pendingStudents.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingStudents.length === 0 ? (
                <p className="text-center text-gray-400 font-medium py-8">No pending students</p>
              ) : (
                pendingStudents.slice(0, 5).map((u) => (
                  <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveUser(u.id, "student")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRejectUser(u.id, "student")}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {pendingStudents.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-50">
                <button
                  onClick={() => setActiveSection("students")}
                  className="text-sm text-green-600 font-bold hover:underline flex items-center gap-1"
                >
                  View all {pendingStudents.length} pending students <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Pending Recruiters */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Pending Recruiters ({pendingRecruiters.length})
              </h3>
            </div>
            <div className="divide-y divide-gray-50">
              {pendingRecruiters.length === 0 ? (
                <p className="text-center text-gray-400 font-medium py-8">No pending recruiters</p>
              ) : (
                pendingRecruiters.slice(0, 5).map((u) => (
                  <div key={u.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveUser(u.id, "company")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleRejectUser(u.id, "company")}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {pendingRecruiters.length > 5 && (
              <div className="px-6 py-3 border-t border-gray-50">
                <button
                  onClick={() => setActiveSection("companies")}
                  className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  View all {pendingRecruiters.length} pending recruiters <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Nav Cards */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {NAV_SECTIONS.filter(s => s.id !== "home").map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 hover:-translate-y-1 transition-all group"
                >
                  <div className="p-2 bg-green-50 text-green-700 rounded-xl group-hover:bg-green-100 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-gray-600 text-center leading-tight">{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-green-50 hidden md:flex flex-col shrink-0">
        <div className="p-5 border-b border-green-800">
          <h1 className="text-2xl font-bold text-white">EDUVATE</h1>
          <p className="text-xs text-green-300 mt-0.5">Admin Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-green-700 text-white shadow-sm"
                    : "text-green-200 hover:bg-green-800 hover:text-white"
                }`}
              >
                <Icon size={17} className="shrink-0" />
                {section.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-green-800">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-300 hover:bg-red-900/30 hover:text-red-200 transition-all"
          >
            <LogOut size={17} className="shrink-0" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top breadcrumb bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span className="text-green-800 font-bold">Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-800 font-semibold capitalize">
              {NAV_SECTIONS.find(s => s.id === activeSection)?.label || "Dashboard"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 md:p-8">
          {renderContent()}
        </div>
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