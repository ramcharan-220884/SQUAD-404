import React, { useState } from "react";
import {
  Search,
  Plus,
  Download,
  Filter,
  MoreVertical,
  Users,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Eye,
  Edit2,
  Trash2,
  User
} from "lucide-react";

export default function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  const skillColors = {
    "Java": "bg-orange-100 text-orange-700 border-orange-200",
    "Python": "bg-blue-100 text-blue-700 border-blue-200",
    "React": "bg-cyan-100 text-cyan-700 border-cyan-200",
    "Node.js": "bg-green-100 text-green-700 border-green-200",
    "C++": "bg-indigo-100 text-indigo-700 border-indigo-200",
    "JS": "bg-yellow-100 text-yellow-700 border-yellow-200",
  };

  const getSkillColor = (skill) => skillColors[skill] || "bg-gray-100 text-gray-700 border-gray-200";

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const stats = [
    { title: "Total Students", value: "1,250", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Placed Students", value: "640", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { title: "Not Placed Students", value: "470", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const students = [
    {
      id: "STUD001",
      name: "Rahul Sharma",
      branch: "CSE",
      cgpa: "8.5",
      skills: ["Java", "React", "Node.js"],
      status: "Placed",
    },
    {
      id: "STUD002",
      name: "Priya Patel",
      branch: "ECE",
      cgpa: "7.8",
      skills: ["Python", "C++", "Embedded"],
      status: "Not Placed",
    },
    {
      id: "STUD003",
      name: "Amit Kumar",
      branch: "MECH",
      cgpa: "9.2",
      skills: ["MATLAB", "AutoCAD", "Python"],
      status: "Placed",
    },
    {
      id: "STUD004",
      name: "Sneha Reddy",
      branch: "CSE",
      cgpa: "8.1",
      skills: ["React", "Firebase", "JS"],
      status: "Not Placed",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Management</h2>
          <p className="text-gray-500 font-medium mt-1">Manage and track student placement progress.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95">
          <Plus className="w-5 h-5" /> Add Student
        </button>
      </div>

      {/* Stats Cards */}
      <div className="max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl py-3 px-4 shadow-sm border border-gray-100 flex items-center gap-3 group hover:-translate-y-1.5 hover:shadow-xl hover:border-green-100 transition-all duration-300 cursor-default relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50/50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
              <div className={`p-2.5 ${stat.bg} ${stat.color} rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-current/10 relative z-10`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] shrink-0">{stat.title}</p>
                <h4 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
        <div className="flex flex-1 flex-wrap gap-5">
          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Academic Year</label>
            <div className="relative group">
              <select className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                <option>2024 - 2025</option>
                <option>2023 - 2024</option>
                <option>2022 - 2023</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-green-500 transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Branch</label>
            <div className="relative group">
              <select className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                <option>All Branches</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>EEE</option>
                <option>MECH</option>
                <option>CIVIL</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-green-500 transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Placement Status</label>
            <div className="relative group">
              <select className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                <option>All Status</option>
                <option>Placed</option>
                <option>Not Placed</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-green-500 transition-colors" />
            </div>
          </div>
        </div>
        
        <button className="self-end mb-1 flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-100 text-green-700 font-bold rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all shadow-sm group active:scale-95">
          <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" /> Export
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-300 group-focus-within:text-green-500 transition-all duration-300">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Roll Number, Name or Branch..."
          className="w-full pl-16 pr-6 py-4.5 bg-white border-2 border-gray-100 rounded-3xl outline-none focus:border-green-500 focus:ring-[6px] focus:ring-green-500/5 focus:shadow-xl transition-all duration-300 text-sm font-semibold placeholder:text-gray-300"
        />
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-visible relative">
        <div className="overflow-x-auto rounded-[2rem]">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-3 whitespace-nowrap">Roll No</th>
                <th className="px-6 py-3 whitespace-nowrap">Student Details</th>
                <th className="px-6 py-3 whitespace-nowrap">Branch</th>
                <th className="px-6 py-3 whitespace-nowrap text-center">CGPA</th>
                <th className="px-6 py-3 whitespace-nowrap">Skills</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="even:bg-gray-50/30 hover:bg-green-50/40 transition-all duration-200 group relative">
                  <td className="px-6 py-2 text-[11px] font-bold text-gray-400 tracking-wider font-mono uppercase whitespace-nowrap">{student.id}</td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-green-50 to-emerald-100 flex items-center justify-center text-green-600 border border-green-200 shadow-sm transition-transform group-hover:scale-105 shrink-0">
                        <User className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="font-bold text-gray-900 text-sm group-hover:text-green-700 transition-colors uppercase tracking-tight whitespace-nowrap">{student.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-gray-200/50">
                      {student.branch}
                    </span>
                  </td>
                  <td className="px-6 py-2 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-black text-xs shadow-sm">
                      <GraduationCap className="w-3.5 h-3.5" />
                      {student.cgpa}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map((skill, idx) => (
                        <span key={idx} className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all duration-300 ${getSkillColor(skill)}`}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-2 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${
                      student.status === "Placed" ? "bg-green-500 text-white border-green-600 shadow-md shadow-green-500/20" : "bg-white text-gray-400 border-gray-200"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${student.status === "Placed" ? "bg-white animate-pulse" : "bg-gray-300"}`}></span>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-2 text-right relative whitespace-nowrap">
                    <button 
                      onClick={() => toggleMenu(student.id)}
                      className={`p-1.5 rounded-xl transition-all duration-200 ${activeMenu === student.id ? "bg-green-600 text-white shadow-lg" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Actions Dropdown */}
                    {activeMenu === student.id && (
                      <div className="absolute right-8 top-16 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] animate-in slide-in-from-top-2 fade-in duration-200 divide-y divide-gray-50 overflow-hidden">
                        <button className="w-full px-5 py-3 text-left text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors">
                          <Eye className="w-4 h-4" /> View Profile
                        </button>
                        <button className="w-full px-5 py-3 text-left text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button className="w-full px-5 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing <span className="text-gray-900">1 to 4</span> of 1,250 students
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-400 transition-all cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[1, 2, 3].map((page) => (
              <button key={page} className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all ${
                page === 1 ? "bg-green-600 text-white shadow-md shadow-green-600/20" : "border border-gray-200 text-gray-600 hover:bg-white"
              }`}>
                {page}
              </button>
            ))}
            <span className="text-gray-400 px-1 text-sm">...</span>
            <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-600 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
