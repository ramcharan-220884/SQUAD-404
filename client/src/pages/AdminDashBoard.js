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

import { getStats, getPendingUsers, approveUser, rejectUser, getPlacementAnalytics } from "../services/adminService";

const PIE_COLORS = ["#16a34a", "#facc15", "#dc2626"];

export default function AdminDashboard() {
  const { showNotification } = useNotification();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stats, setStats] = useState(null);
  const [placementAnalytics, setPlacementAnalytics] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const location = useLocation();

  // Reset dark mode on navigation
  useEffect(() => {
    setIsDarkMode(false);
  }, [location.pathname]);

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
        pendingData.filter(u => u.type === "student")
      );

      setPendingRecruiters(
        pendingData.filter(u => u.type === "company")
      );

    } catch (err) {
      console.error("Error fetching admin data:", err);
      showNotification(`Failed to fetch dashboard data: ${err.message}`, "error", "admin");
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      socketService.connect(token);
    }

    const searchParams = new URLSearchParams(location.search);
    const scrollTarget = searchParams.get("scroll");

    if (scrollTarget === "analytics") {
      const element = document.getElementById("analytics-section");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } else if (scrollTarget === "top") {
      const element = document.getElementById("dashboard-top");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }

    fetchData();

    return () => {
      // Admin might not need many listeners yet, but we connect to the room
    };
  }, [fetchData, location]);

  const handleStudentAction = async (id, action) => {
    try {
      if (action === "Approve") {
        await approveUser(id, "student");
      } else {
        await rejectUser(id, "student");
      }
      showNotification(`Student ${action}d successfully`, "success", "admin");
      fetchData();
    } catch (err) {
      console.error(`Failed to ${action} student`, err);
      showNotification(`Failed to ${action} student`, "error", "admin");
    }
  };

  const handleActionRecruiter = async (id, action, type) => {
    try {
      if (action === "approve") {
        await approveUser(id, type);
      } else {
        await rejectUser(id, type);
      }
      showNotification(`Recruiter ${action}d successfully`, "success", "admin");
      fetchData();
    } catch (err) {
      console.error(`Failed to ${action} recruiter`, err);
      showNotification(`Failed to ${action} recruiter`, "error", "admin");
    }
  };

  const statCards = stats ? [

    {
      title: "Total Students",
      value: String(stats.totalStudents || 0),
      icon: <Users className="w-6 h-6 text-green-600" />,
      change: "Live"
    },

    {
      title: "Total Recruiters",
      value: String(stats.activeCompanies || 0),
      icon: <Building className="w-6 h-6 text-green-600" />,
      change: "Live"
    },

    {
      title: "Active Jobs",
      value: String(stats.totalJobs || 0),
      icon: <Briefcase className="w-6 h-6 text-green-600" />,
      change: "Live"
    },

    {
      title: "Pending Approvals",
      value: String(stats.pendingApprovals || 0),
      icon: <FileCheck className="w-6 h-6 text-green-600" />,
      change: "Action Required"
    },

    {
      title: "Pending Students",
      value: String(pendingStudents.length),
      icon: <UserPlus className="w-6 h-6 text-green-600" />,
      change: "Live"
    },

    {
      title: "Pending Recruiters",
      value: String(pendingRecruiters.length),
      icon: <Building className="w-6 h-6 text-green-600" />,
      change: "Live"
    }

  ] : [];

  const applicationStatus = stats ? [

    {
      name: "Active Students",
      value: Math.max(0, (stats.totalStudents || 0) - pendingStudents.length)
    },

    {
      name: "Pending",
      value: stats.pendingApprovals || 0
    },

    {
      name: "Active Companies",
      value: stats.activeCompanies || 0
    }

  ] : [];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-gray-50 ${isDarkMode ? 'feature-dark' : ''}`}>

      <aside className="w-64 bg-green-900 text-green-50 flex flex-col hidden md:flex">

        <div className="p-4">
          <h1 className="text-2xl font-bold text-white">EDUVATE</h1>
          <p className="text-xs text-green-300">Admin Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">

          <Link to="/admin-dashboard?scroll=top" className="flex items-center gap-2">
            <LayoutDashboard size={18}/> Home
          </Link>

          <Link to="/admin-dashboard/students" className="flex items-center gap-2">
            <Users size={18}/> Students
          </Link>

          <Link to="/admin-dashboard/companies" className="flex items-center gap-2">
            <Building size={18}/> Companies
          </Link>

          <Link to="/admin-dashboard/announcements" className="flex items-center gap-2">
            <Megaphone size={18}/> Announcements
          </Link>

          <Link to="/admin-dashboard/competitions" className="flex items-center gap-2">
            <Trophy size={18}/> Competitions
          </Link>

          <Link to="/admin-dashboard/events" className="flex items-center gap-2">
            <Calendar size={18}/> Events
          </Link>

          <Link to="/admin-dashboard/assessments" className="flex items-center gap-2">
            <FileCheck size={18}/> Assessments
          </Link>

          <Link to="/admin-dashboard/interviews" className="flex items-center gap-2">
            <Mic size={18}/> Interviews
          </Link>

          <Link to="/admin-dashboard/settings" className="flex items-center gap-2">
            <SettingsIcon size={18}/> Settings
          </Link>

          <Link to="/admin-dashboard/help" className="flex items-center gap-2">
            <HelpCircle size={18}/> Help
          </Link>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-2 text-red-300"
          >
            <LogOut size={18}/> Logout
          </button>

        </nav>

      </aside>

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
        ) : location.pathname === "/admin-dashboard/interviews" ? (
          <Interviews role="admin" />
        ) : location.pathname === "/admin-dashboard/settings" ? (
          <Settings />
        ) : location.pathname === "/admin-dashboard/help" ? (
          <HelpSupport role="admin" />
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Overview Dashboard</h2>
              <ThemeToggle 
                role="admin" 
                isDarkMode={isDarkMode} 
                onToggle={() => setIsDarkMode(!isDarkMode)} 
              />
            </div>

            <div className="grid grid-cols-3 gap-6 mb-10">
              {statCards.map((stat,i)=>(
                <div key={i} className="bg-white p-6 rounded-xl shadow">
                  {stat.icon}
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-8">

              <div className="w-full h-[300px]">
                {placementAnalytics.length === 0 ? (
                  <div className="w-full h-full border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                    No Data Available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={placementAnalytics}>
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis dataKey="year"/>
                      <YAxis/>
                      <Tooltip/>
                      <Bar dataKey="placements" fill="#16a34a"/>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="w-full h-[300px]">
                {applicationStatus.length === 0 || applicationStatus.every(s => s.value === 0) ? (
                  <div className="w-full h-full border-2 border-dashed border-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                    No Data Available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={applicationStatus}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                      >
                        {applicationStatus.map((entry,index)=>(
                          <Cell key={index} fill={PIE_COLORS[index]} />
                        ))}
                      </Pie>
                      <Legend/>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

            </div>

            {/* Pending Approvals Section */}
            <div className="mt-10 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <UserPlus className="w-6 h-6 text-green-600" /> Pending Registrations
                </h3>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {pendingStudents.length} Students
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                    {pendingRecruiters.length} Companies
                  </span>
                </div>
              </div>
              {pendingStudents.length === 0 && pendingRecruiters.length === 0 ? (
                <div className="p-12 text-center text-gray-400 font-bold border-t border-gray-50">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  No pending registrations to review at this time.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white text-gray-400 text-[11px] uppercase tracking-widest font-bold border-b border-gray-50">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {[...pendingStudents, ...pendingRecruiters].map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 transition-all">
                          <td className="px-6 py-4 font-bold text-sm text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                              user.type === 'student' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                              {user.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => user.type === 'student' ? handleStudentAction(user.id, "Approve") : handleActionRecruiter(user.id, "approve", "company")}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm active:scale-95"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => user.type === 'student' ? handleStudentAction(user.id, "Reject") : handleActionRecruiter(user.id, "reject", "company")}
                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm active:scale-95"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

      </main>

      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-xl">
            <p className="mb-4">Are you sure you want to logout?</p>

            <div className="flex gap-4">
              <button
                onClick={()=>setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <Link
                to="/"
                onClick={()=>{
                  localStorage.removeItem("adminToken");
                  sessionStorage.clear();
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Logout
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}