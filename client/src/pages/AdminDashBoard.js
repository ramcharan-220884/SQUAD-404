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

// ── localStorage helpers for Resource approvals ──────────────────────────────
const LS_RES_PENDING  = "pendingResources";
const LS_RES_APPROVED = "approvedResources";
const getAdminResPending  = () => JSON.parse(localStorage.getItem(LS_RES_PENDING))  || [];
const getAdminResApproved = () => JSON.parse(localStorage.getItem(LS_RES_APPROVED)) || [];
const setAdminResPending  = (arr) => localStorage.setItem(LS_RES_PENDING,  JSON.stringify(arr));
const setAdminResApproved = (arr) => localStorage.setItem(LS_RES_APPROVED, JSON.stringify(arr));
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { showNotification } = useNotification();
  const [stats, setStats] = useState(null);
  const [placementAnalytics, setPlacementAnalytics] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pendingResources, setPendingResources] = useState(getAdminResPending);

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

    // Sync resource pending list from localStorage
    const syncResources = () => setPendingResources(getAdminResPending());
    window.addEventListener('storage', syncResources);
    return () => window.removeEventListener('storage', syncResources);
  }, [fetchData, location]);

  const approveResource = (id) => {
    const pending = getAdminResPending();
    const res = pending.find(r => r.id === id);
    if (!res) return;
    const newPending  = pending.filter(r => r.id !== id);
    const newApproved = [...getAdminResApproved(), { ...res, status: 'approved' }];
    setAdminResPending(newPending);
    setAdminResApproved(newApproved);
    setPendingResources(newPending);
    showNotification("Resource approved — now visible to students!", "success", "admin");
  };

  const rejectResource = (id) => {
    const newPending = getAdminResPending().filter(r => r.id !== id);
    setAdminResPending(newPending);
    setPendingResources(newPending);
    showNotification("Resource rejected.", "error", "admin");
  };

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

        {location.pathname === "/admin-dashboard/students" ? (
          <StudentManagement />
        ) : location.pathname === "/admin-dashboard/companies" ? (
          <CompanyManagement />
        ) : location.pathname === "/admin-dashboard/announcements" ? (
          <Announcements />
        ) : location.pathname === "/admin-dashboard/competitions" ? (
          <Competitions role="admin" />
        ) : location.pathname === "/admin-dashboard/events" ? (
          <Events role="admin" />
        ) : location.pathname === "/admin-dashboard/assessments" ? (
          <Assessments role="admin" />
        ) : location.pathname === "/admin-dashboard/settings" ? (
          <Settings />
        ) : location.pathname === "/admin-dashboard/help" ? (
          <HelpSupport role="admin" />
        ) : location.pathname === "/admin-dashboard/interviews" ? (
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

            {/* Pending Resource Requests */}
            {pendingResources.length > 0 && (
              <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '2px dashed #93c5fd' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ padding: '8px', background: '#dbeafe', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
                    <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#2563eb" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Pending Resource Requests</h3>
                    <p style={{ fontSize: '12px', color: '#2563eb', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Submitted by students — awaiting your approval</p>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                  {pendingResources.map(r => (
                    <div key={r.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '16px', padding: '20px', position: 'relative', boxShadow: '0 2px 8px rgba(37,99,235,0.06)', transition: 'box-shadow 0.2s' }}>
                      <span style={{ position: 'absolute', top: '12px', right: '12px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', border: '1px solid #bfdbfe' }}>Pending</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid #c7d2fe' }}>{r.branch}</span>
                        <span style={{ background: '#f0fdf4', color: '#15803d', padding: '2px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, border: '1px solid #bbf7d0' }}>{r.category}</span>
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '8px', paddingRight: '60px', lineHeight: 1.4 }}>{r.title}</h4>
                      <a href={r.link.startsWith('http') ? r.link : `https://${r.link}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: '#2563eb', fontWeight: 600, wordBreak: 'break-all', display: 'block', marginBottom: '16px' }}>{r.link}</a>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => approveResource(r.id)}
                          style={{ flex: 1, padding: '9px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <CheckCircle size={15} /> Approve
                        </button>
                        <button onClick={() => rejectResource(r.id)}
                          style={{ flex: 1, padding: '9px', background: '#fff', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <XCircle size={15} /> Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}