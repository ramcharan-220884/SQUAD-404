import React, { useState, useEffect } from "react";
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
  XCircle
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

  // Fetch live data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, pendingData] = await Promise.all([
          getStats(),
          getPendingUsers()
        ]);
        setStats(statsData);
        setPendingStudents(pendingData.filter(u => u.type === "student"));
        setPendingRecruiters(pendingData.filter(u => u.type === "company"));
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
      // Refresh stats
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
      setPendingRecruiters(prev => prev.filter(r => r.id !== id));
      // Refresh stats
      const updatedStats = await getStats();
      setStats(updatedStats);
    } catch (err) {
      console.error(`Failed to ${action} recruiter:`, err);
      alert(`Failed to ${action} recruiter. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  // Build stat cards from live data
  const statCards = stats ? [
    { title: "Total Students", value: String(stats.totalStudents || 0), icon: <Users className="w-6 h-6 text-green-600" />, change: "Live" },
    { title: "Total Recruiters", value: String(stats.activeCompanies || 0), icon: <Building className="w-6 h-6 text-green-600" />, change: "Live" },
    { title: "Active Jobs", value: String(stats.totalJobs || 0), icon: <Briefcase className="w-6 h-6 text-green-600" />, change: "Live" },
    { title: "Pending Approvals", value: String(stats.pendingApprovals || 0), icon: <FileCheck className="w-6 h-6 text-green-600" />, change: `${pendingStudents.length + pendingRecruiters.length} pending` },
    { title: "Pending Students", value: String(pendingStudents.length), icon: <UserPlus className="w-6 h-6 text-green-600" />, change: "Live" },
    { title: "Pending Recruiters", value: String(pendingRecruiters.length), icon: <Building className="w-6 h-6 text-green-600" />, change: "Live" },
  ] : [];

  // Build pie chart from live data
  const applicationStatus = stats ? [
    { name: "Active Students", value: Math.max(0, (stats.totalStudents || 0) - pendingStudents.length) },
    { name: "Pending", value: stats.pendingApprovals || 0 },
    { name: "Active Companies", value: stats.activeCompanies || 0 },
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
          <p className="text-sm text-green-300 mt-1 uppercase tracking-widest font-semibold">Admin Portal</p>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
          <a href="#" className="flex items-center gap-3 px-4 py-3 bg-green-800 text-white rounded-xl shadow-inner font-medium transition-all">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl transition-all font-medium">
            <Users className="w-5 h-5" />
            User Management
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl transition-all font-medium">
            <Briefcase className="w-5 h-5" />
            Jobs & Placement Admin
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl transition-all font-medium">
            <Calendar className="w-5 h-5" />
            Events & Fests Admin
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl transition-all font-medium">
            <FileCheck className="w-5 h-5" />
            Assessments & Results
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl transition-all font-medium">
            <Settings className="w-5 h-5" />
            Settings & Configurations
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 text-green-200 hover:text-white hover:bg-green-800/50 rounded-xl transition-all font-medium">
            <HelpCircle className="w-5 h-5" />
            Support & Reports
          </a>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-green-800 rounded-xl p-4 shadow-sm border border-green-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-white text-green-800 flex items-center justify-center font-bold text-lg">
                A
              </div>
              <div>
                <p className="text-sm font-bold text-white">Super Admin</p>
                <p className="text-xs text-green-300">admin@eduvate.com</p>
              </div>
            </div>
            <a href="/" className="block mt-4 text-center text-sm text-green-100 bg-green-900/50 hover:bg-green-700 py-2 rounded-lg font-medium transition-colors border border-green-700/50 hover:border-green-600">
              Logout
            </a>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between md:hidden sticky top-0 z-10">
          <h1 className="text-xl font-bold tracking-wider text-green-900 flex items-center gap-2">
            <span className="bg-green-900 text-white p-1 rounded text-sm">E</span>DUVATE
          </h1>
          <button className="text-green-900 p-2">
            <LayoutDashboard className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Overview Dashboard</h2>
              <p className="text-gray-500 font-medium mt-1">Welcome back. Here is what's happening today.</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-green-100 text-green-700 font-bold rounded-xl hover:bg-green-50 hover:border-green-200 transition-all shadow-sm">
                <Calendar className="w-4 h-4" /> Selected Date: Today
              </button>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95">
                <Activity className="w-4 h-4" /> Download Report
              </button>
            </div>
          </div>

          {/* Stat Cards — Live Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out opacity-50 pointer-events-none"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="p-3 bg-green-50 rounded-xl text-green-600 border border-green-100">
                    {stat.icon}
                  </div>
                  <span className="text-sm font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                    {stat.change}
                  </span>
                </div>
                <div className="relative z-10">
                  <h3 className="text-gray-500 font-medium text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Student Placements – Yearly Trend
                </h3>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={YEARLY_PLACEMENTS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 13, fontWeight: 500 }} />
                    <Tooltip
                      cursor={{ fill: '#f0fdf4' }}
                      contentStyle={{ borderRadius: '12px', borderColor: '#dcfce3', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px 16px', fontWeight: 600, color: '#166534' }}
                    />
                    <Bar dataKey="placements" fill="#16a34a" radius={[6, 6, 0, 0]} maxBarSize={60} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[450px]">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-green-600" />
                  Platform Overview
                </h3>
              </div>
              <div className="flex-1 w-full flex items-center justify-center min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={applicationStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {applicationStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                      itemStyle={{ color: '#111827' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(value) => <span className="text-gray-700 font-semibold ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Approvals Section — Live Data */}
          <div className="space-y-8">
            {/* Pending Students Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <UserPlus className="w-5 h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Pending Students</h3>
                </div>
                <span className="bg-orange-100 text-orange-700 py-1.5 px-3 rounded-full text-xs font-black tracking-wide uppercase">
                  {pendingStudents.length} actions required
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest">
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Registration Date</th>
                      <th className="px-6 py-4 font-bold w-48 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pendingStudents.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">No pending student approvals.</td>
                      </tr>
                    ) : pendingStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{student.email}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm font-medium">{new Date(student.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 flex gap-2 justify-end">
                          <button
                            onClick={() => handleStudentAction(student.id, "Approve")}
                            disabled={actionLoading === `student-${student.id}-Approve`}
                            className="p-2 sm:px-3 sm:py-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg flex items-center justify-center gap-1.5 font-bold transition-colors border border-green-200 hover:border-green-600 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm">
                              {actionLoading === `student-${student.id}-Approve` ? "..." : "Approve"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleStudentAction(student.id, "Reject")}
                            disabled={actionLoading === `student-${student.id}-Reject`}
                            className="p-2 sm:px-3 sm:py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center gap-1.5 font-bold transition-colors border border-red-200 hover:border-red-600 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm">
                              {actionLoading === `student-${student.id}-Reject` ? "..." : "Reject"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Recruiters Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Building className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Pending Recruiters</h3>
                </div>
                <span className="bg-purple-100 text-purple-700 py-1.5 px-3 rounded-full text-xs font-black tracking-wide uppercase">
                  {pendingRecruiters.length} actions required
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-100 text-gray-500 text-xs uppercase tracking-widest">
                      <th className="px-6 py-4 font-bold">Company Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Registration Date</th>
                      <th className="px-6 py-4 font-bold w-48 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pendingRecruiters.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">No pending recruiter approvals.</td>
                      </tr>
                    ) : pendingRecruiters.map((recruiter) => (
                      <tr key={recruiter.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{recruiter.name}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{recruiter.email}</td>
                        <td className="px-6 py-4 text-gray-500 text-sm font-medium">{new Date(recruiter.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 flex gap-2 justify-end">
                          <button
                            onClick={() => handleRecruiterAction(recruiter.id, "Approve")}
                            disabled={actionLoading === `recruiter-${recruiter.id}-Approve`}
                            className="p-2 sm:px-3 sm:py-2 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-lg flex items-center justify-center gap-1.5 font-bold transition-colors border border-green-200 hover:border-green-600 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm">
                              {actionLoading === `recruiter-${recruiter.id}-Approve` ? "..." : "Approve"}
                            </span>
                          </button>
                          <button
                            onClick={() => handleRecruiterAction(recruiter.id, "Reject")}
                            disabled={actionLoading === `recruiter-${recruiter.id}-Reject`}
                            className="p-2 sm:px-3 sm:py-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg flex items-center justify-center gap-1.5 font-bold transition-colors border border-red-200 hover:border-red-600 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline text-sm">
                              {actionLoading === `recruiter-${recruiter.id}-Reject` ? "..." : "Reject"}
                            </span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}