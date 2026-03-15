import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileCheck,
  Settings as SettingsIcon,
  HelpCircle,
  TrendingUp,
  Activity,
  UserPlus,
  Building,
  CheckCircle,
  XCircle,
  Megaphone,
  LogOut
} from "lucide-react";

import StudentManagement from "../components/dashboard/StudentManagement";
import CompanyManagement from "../components/dashboard/CompanyManagement";
import Announcements from "../components/dashboard/Announcements";
import Settings from "../components/dashboard/Settings";
import HelpSupport from "../components/dashboard/HelpSupport";

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

import { getStats, getPendingUsers, approveUser, rejectUser } from "../services/adminService";

const YEARLY_PLACEMENTS = [
  { year: "2020", placements: 400 },
  { year: "2021", placements: 650 },
  { year: "2022", placements: 850 },
  { year: "2023", placements: 1200 },
  { year: "2024", placements: 1450 }
];

const PIE_COLORS = ["#16a34a", "#facc15", "#dc2626"];

export default function AdminDashboard() {

  const [stats, setStats] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const scrollTarget = searchParams.get("scroll");

    if (scrollTarget === "analytics") {
      const element = document.getElementById("analytics-section");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    } else if (scrollTarget === "top") {
      const element = document.getElementById("dashboard-top");
      if (element) element.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const [statsData, pendingData] = await Promise.all([
          getStats(),
          getPendingUsers()
        ]);

        setStats(statsData);

        setPendingStudents(
          pendingData.filter(u => u.type === "student")
        );

        setPendingRecruiters(
          pendingData.filter(u => u.type === "company")
        );

      } catch (err) {
        console.error("Error fetching admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStudentAction = async (id, action) => {

    setActionLoading(`student-${id}-${action}`);

    try {

      if (action === "Approve") {
        await approveUser(id, "student");
      } else {
        await rejectUser(id, "student");
      }

      setPendingStudents(prev => prev.filter(s => s.id !== id));

      const updatedStats = await getStats();
      setStats(updatedStats);

    } catch (err) {

      console.error(`Failed to ${action} student`, err);
      alert(`Failed to ${action} student`);

    } finally {
      setActionLoading(null);
    }
  };

  const handleRecruiterAction = async (id, action) => {

    setActionLoading(`recruiter-${id}-${action}`);

    try {

      if (action === "Approve") {
        await approveUser(id, "company");
      } else {
        await rejectUser(id, "company");
      }

      setPendingRecruiters(prev => prev.filter(r => r.id !== id));

      const updatedStats = await getStats();
      setStats(updatedStats);

    } catch (err) {

      console.error(`Failed to ${action} recruiter`, err);
      alert(`Failed to ${action} recruiter`);

    } finally {
      setActionLoading(null);
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
      change: `${pendingStudents.length + pendingRecruiters.length} pending`
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
    <div className="flex h-screen bg-gray-50">

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
        ) : location.pathname === "/admin-dashboard/settings" ? (
          <Settings />
        ) : location.pathname === "/admin-dashboard/help" ? (
          <HelpSupport />
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6">Overview Dashboard</h2>

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

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={YEARLY_PLACEMENTS}>
                  <CartesianGrid strokeDasharray="3 3"/>
                  <XAxis dataKey="year"/>
                  <YAxis/>
                  <Tooltip/>
                  <Bar dataKey="placements" fill="#16a34a"/>
                </BarChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height={300}>
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