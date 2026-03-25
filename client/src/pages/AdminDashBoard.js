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
  MessageSquare,
  LogOut,
  ChevronRight,
  Mic
} from "lucide-react";
import { useNotification } from "../context/NotificationContext";

import StudentManagement from "../components/dashboard/StudentManagement";
import CompanyManagement from "../components/dashboard/CompanyManagement";
import Announcements from "../components/dashboard/Announcements";
import Settings from "../components/dashboard/Settings";
import HelpSupport from "../components/dashboard/HelpSupport";

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
  getPlacementAnalytics,
  getAllStudents,
  getPendingSubmissions,
  approveSubmission,
  rejectSubmission
} from "../services/adminService";

const PIE_COLORS = ["#16a34a", "#facc15", "#dc2626"];

// ── Sidebar nav config ──────────────────────────────────────────────────────
const NAV_SECTIONS = [
  { id: "home",          label: "Home",                 icon: LayoutDashboard },
  { id: "students",      label: "Student",              icon: Users },
  { id: "companies",     label: "Company",              icon: Building },
  { id: "announcements", label: "Announcements",        icon: Megaphone },
  { id: "events",        label: "Campus Events",        icon: Calendar },
  { id: "competitions",  label: "Competitions",         icon: Trophy },
  { id: "communication", label: "Applications",         icon: MessageSquare },
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
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [studentStats, setStudentStats] = useState({ placed: 0, unplaced: 0 });

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
      const [statsData, pendingData, analyticsData, studentsData, subsData] = await Promise.all([
        getStats(),
        getPendingUsers(),
        getPlacementAnalytics().catch(() => []),
        getAllStudents(1, 10000).catch(() => ({ data: [] })),
        getPendingSubmissions().catch(() => [])
      ]);

      setStats(statsData);
      setPlacementAnalytics(analyticsData);
      setPendingSubmissions(subsData || []);

      // Process real student data for Pie Chart
      const studentsList = studentsData.data || studentsData;
      if (Array.isArray(studentsList)) {
        let placed = 0;
        let unplaced = 0;
        studentsList.forEach(s => {
          if (s.status === 'Selected' || s.placed_status === 'Placed') {
            placed++;
          } else {
            unplaced++;
          }
        });
        setStudentStats({ placed, unplaced });
      }

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
  }, [fetchData, location]);

  const handleApproveSubmission = async (type, id) => {
    try {
      await approveSubmission(type, id);
      showNotification(`${type} approved!`, "success", "admin");
      fetchData();
    } catch (err) {
      showNotification(`Failed to approve ${type}`, "error", "admin");
    }
  };

  const handleRejectSubmission = async (type, id) => {
    try {
      await rejectSubmission(type, id);
      showNotification(`${type} rejected.`, "info", "admin");
      fetchData();
    } catch (err) {
      showNotification(`Failed to reject ${type}`, "error", "admin");
    }
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
      { label: "Pending Approvals", value: (pendingStudents.length + pendingRecruiters.length + pendingSubmissions.length), color: "bg-orange-50 text-orange-700" },
      { label: "Total Placements", value: stats?.totalPlacements ?? 0, color: "bg-purple-50 text-purple-700" },
    ];

    const pieData = [
      { name: "Placed", value: studentStats.placed },
      { name: "Unplaced", value: studentStats.unplaced }
    ];

    return (
      <div id="dashboard-top" className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Home Overview</h2>
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
        <div className="grid grid-cols-1 gap-6">


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

        {/* Pending Community Submissions */}
        {pendingSubmissions.length > 0 && (
          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px dashed #93c5fd' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Pending Community Submissions</h3>
                <p style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Events, Competitions & Resources — awaiting your approval</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingSubmissions.map(sub => (
                <div key={`${sub.submission_type}-${sub.id}`} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '20px', position: 'relative', boxShadow: '0 2px 8px rgba(37,99,235,0.06)', transition: 'box-shadow 0.2s', display: 'flex', flexDirection: 'column' }}>
                  <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #bfdbfe' }}>{sub.submission_type}</span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                    <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid #c7d2fe' }}>By: {sub.student_name}</span>
                    {sub.category && <span style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid #bbf7d0' }}>{sub.category}</span>}
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', paddingRight: '60px', lineHeight: 1.4 }}>{sub.title}</h4>
                  
                  {sub.submission_type !== 'resource' && sub.date && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#475569', marginBottom: '8px', fontWeight: 600 }}>
                      <Calendar className="w-3.5 h-3.5" /> {new Date(sub.date).toLocaleDateString()}
                    </div>
                  )}

                  {sub.link && (
                    <a href={sub.link.startsWith('http') ? sub.link : `https://${sub.link}`} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, wordBreak: 'break-all', display: 'block', marginBottom: '16px' }}>Link attached</a>
                  )}

                  <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                    <button onClick={() => handleApproveSubmission(sub.submission_type, sub.id)}
                      style={{ flex: 1, padding: '9px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle size={15} /> Approve
                    </button>
                    <button onClick={() => handleRejectSubmission(sub.submission_type, sub.id)}
                      style={{ flex: 1, padding: '9px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <XCircle size={15} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


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
            const isHome = section.id === "home";
            
            return (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  if (isHome) {
                    document.getElementById("dashboard-top")?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
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
              {NAV_SECTIONS.find(s => s.id === activeSection)?.label || "Home"}
            </span>
          </div>
          <div className="flex items-center gap-3">
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