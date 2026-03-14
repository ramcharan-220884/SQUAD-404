import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Calendar,
  FileCheck,
  Settings,
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
  { year: "2024", placements: 1450 },
];

const PIE_COLORS = ["#16a34a", "#facc15", "#dc2626"];

export default function AdminDashboard() {

  const [stats, setStats] = useState(null);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [pendingRecruiters, setPendingRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const location = useLocation();

  const menuItems = [
    { id: 1, name: "Dashboard", path: "/admin-dashboard", icon: LayoutDashboard },
    { id: 2, name: "Student Management", path: "/admin-dashboard/students", icon: Users },
    { id: 3, name: "Company Management", path: "/admin-dashboard/companies", icon: Building },
    { id: 4, name: "Analytics", path: "/admin-dashboard/analytics", icon: TrendingUp },
    { id: 5, name: "Announcements", path: "/admin-dashboard/announcements", icon: Megaphone },
    { id: 6, name: "Settings", path: "/admin-dashboard/settings", icon: Settings }
  ];

  // Fetch live data
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

      setPendingStudents(prev =>
        prev.filter(s => s.id !== id)
      );

      const updatedStats = await getStats();
      setStats(updatedStats);

    } catch (err) {

      console.error(`Failed to ${action} student:`, err);
      alert(`Failed to ${action} student. Please try again.`);

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

      setPendingRecruiters(prev =>
        prev.filter(r => r.id !== id)
      );

      const updatedStats = await getStats();
      setStats(updatedStats);

    } catch (err) {

      console.error(`Failed to ${action} recruiter:`, err);
      alert(`Failed to ${action} recruiter. Please try again.`);

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
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      {/* Sidebar */}

      <aside className="w-64 bg-green-900 text-green-50 flex flex-col hidden md:flex shrink-0">

        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider text-white flex items-center gap-2">
            <span className="bg-white text-green-900 p-1 rounded">E</span>DUVATE
          </h1>

          <p className="text-sm text-green-300 mt-1 uppercase tracking-widest font-semibold">
            Admin Portal
          </p>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">

          {menuItems.map((item) => {

            const isActive = location.pathname === item.path;

            return (

              <Link
                key={item.id}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                    ? "bg-green-800 text-white shadow-inner"
                    : "text-green-200 hover:text-white hover:bg-green-800/50"
                  }`}
              >

                <item.icon className="w-5 h-5" />

                {item.name}

              </Link>

            );

          })}

        </nav>

        <div className="mt-auto px-4 py-6 space-y-6 border-t border-green-800/50">

          <div className="space-y-2">

            <p className="px-4 text-[11px] font-bold text-green-400 uppercase tracking-widest opacity-70">
              Support
            </p>

            <nav className="space-y-1">

              <Link
                to="/admin-dashboard/help"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl transition-all font-medium"
              >
                <HelpCircle className="w-5 h-5" />
                Help & Support
              </Link>

              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl transition-all font-medium"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Link>

            </nav>

          </div>

        </div>

      </aside>

      {/* Main Content */}

      <main className="flex-1 overflow-y-auto w-full">

        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Overview Dashboard
          </h2>

          {/* Stat Cards */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {statCards.map((stat, i) => (

              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border">

                <div className="flex justify-between mb-3">
                  {stat.icon}
                  <span className="text-sm text-green-700 font-bold">
                    {stat.change}
                  </span>
                </div>

                <h3 className="text-gray-500 text-sm">
                  {stat.title}
                </h3>

                <p className="text-3xl font-bold">
                  {stat.value}
                </p>

              </div>

            ))}

          </div>

        </div>

      </main>

    </div>
  );
}