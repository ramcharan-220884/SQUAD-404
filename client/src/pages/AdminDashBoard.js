import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

export default function AdminDashboard() {
  const { showNotification } = useNotification();
  const [stats, setStats] = useState(null);
  const [placementAnalytics, setPlacementAnalytics] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const location = useLocation();

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

      setPendingStudents(pendingData.filter(u => u.type === "student"));
      setPendingRecruiters(pendingData.filter(u => u.type === "company"));
    } catch (err) {
      console.error("Error fetching admin data:", err);
      showNotification(`Failed to fetch dashboard data: ${err.message}`, "error", "admin");
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
      document.getElementById("analytics-section")?.scrollIntoView({ behavior: "smooth" });
    } else if (scrollTarget === "top") {
      document.getElementById("dashboard-top")?.scrollIntoView({ behavior: "smooth" });
    }

    fetchData();
  }, [fetchData, location]);

  const handleStudentAction = async (id, action) => {
    try {
      if (action === "Approve") await approveUser(id, "student");
      else await rejectUser(id, "student");

      showNotification(`Student ${action}d successfully`, "success", "admin");
      fetchData();
    } catch (err) {
      showNotification(`Failed to ${action} student`, "error", "admin");
    }
  };

  const handleActionRecruiter = async (id, action, type) => {
    try {
      if (action === "approve") await approveUser(id, type);
      else await rejectUser(id, type);

      showNotification(`Recruiter ${action}d successfully`, "success", "admin");
      fetchData();
    } catch (err) {
      showNotification(`Failed to ${action} recruiter`, "error", "admin");
    }
  };

  const statCards = stats ? [
    { title: "Total Students", value: String(stats.totalStudents || 0), icon: <Users className="w-6 h-6 text-green-600" /> },
    { title: "Total Recruiters", value: String(stats.activeCompanies || 0), icon: <Building className="w-6 h-6 text-green-600" /> },
    { title: "Active Jobs", value: String(stats.totalJobs || 0), icon: <Briefcase className="w-6 h-6 text-green-600" /> },
    { title: "Pending Approvals", value: String(stats.pendingApprovals || 0), icon: <FileCheck className="w-6 h-6 text-green-600" /> },
    { title: "Pending Students", value: String(pendingStudents.length), icon: <UserPlus className="w-6 h-6 text-green-600" /> },
    { title: "Pending Recruiters", value: String(pendingRecruiters.length), icon: <Building className="w-6 h-6 text-green-600" /> }
  ] : [];

  const applicationStatus = stats ? [
    { name: "Active Students", value: Math.max(0, (stats.totalStudents || 0) - pendingStudents.length) },
    { name: "Pending", value: stats.pendingApprovals || 0 },
    { name: "Active Companies", value: stats.activeCompanies || 0 }
  ] : [];

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-green-900 text-green-50 hidden md:flex flex-col">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">EDUVATE</h1>
          <p className="text-xs text-green-300">Admin Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <Link to="/admin-dashboard?scroll=top" className="flex gap-2"><LayoutDashboard size={18}/> Home</Link>
          <Link to="/admin-dashboard/students" className="flex gap-2"><Users size={18}/> Students</Link>
          <Link to="/admin-dashboard/companies" className="flex gap-2"><Building size={18}/> Companies</Link>
          <Link to="/admin-dashboard/announcements" className="flex gap-2"><Megaphone size={18}/> Announcements</Link>
          <Link to="/admin-dashboard/competitions" className="flex gap-2"><Trophy size={18}/> Competitions</Link>
          <Link to="/admin-dashboard/events" className="flex gap-2"><Calendar size={18}/> Events</Link>

          <Link to="/admin-dashboard/assessments" className="flex gap-2"><FileCheck size={18}/> Assessments</Link>
          <Link to="/admin-dashboard/interviews" className="flex gap-2"><Mic size={18}/> Interviews</Link>
          <Link to="/admin-dashboard/applications" className="flex gap-2"><MessageSquare size={18}/> Applications</Link>

          <Link to="/admin-dashboard/settings" className="flex gap-2"><SettingsIcon size={18}/> Settings</Link>
          <Link to="/admin-dashboard/help" className="flex gap-2"><HelpCircle size={18}/> Help</Link>

          <button onClick={() => setShowLogoutConfirm(true)} className="flex gap-2 text-red-300">
            <LogOut size={18}/> Logout
          </button>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-6">

        {location.pathname === "/admin-dashboard/interviews" ? (
          <Interviews role="admin" />
        ) : location.pathname === "/admin-dashboard/applications" ? (
          <CandidateCommunication />
        ) : (
          <>
            <div className="flex justify-between mb-6">
              <h2 className="text-3xl font-bold">Overview Dashboard</h2>
              <ThemeToggle role="admin" />
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
              {statCards.map((s, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow">
                  {s.icon}
                  <p>{s.title}</p>
                  <p className="text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={placementAnalytics}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="year"/>
                  <YAxis/>
                  <Tooltip/>
                  <Bar dataKey="placements" fill="#16a34a"/>
                </BarChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={applicationStatus} dataKey="value" outerRadius={100}>
                    {applicationStatus.map((e, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Legend/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

      </main>
    </div>
  );
}