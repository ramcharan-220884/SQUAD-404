import React, { useState } from "react";
import {
  Megaphone,
  Plus,
  Filter,
  Calendar,
  Download,
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Pin,
  ChevronLeft,
  ChevronRight,
  User,
  Tag,
  Clock
} from "lucide-react";

export default function Announcements() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  const stats = [
    { title: "Total Announcements", value: "128", icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Active Announcements", value: "45", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { title: "Expired Announcements", value: "83", icon: XCircle, color: "text-gray-500", bg: "bg-gray-50" },
    { title: "Urgent Notices", value: "12", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  const announcements = [
    {
      id: "ANN001",
      title: "TCS Mass Recruitment Drive",
      category: "Placement",
      audience: "All Students",
      startDate: "20 Mar 2026",
      expiryDate: "25 Mar 2026",
      status: "Active",
      isPinned: true
    },
    {
      id: "ANN002",
      title: "Annual Cultural Fest - EUPHORIA",
      category: "Event",
      audience: "All Students",
      startDate: "15 Apr 2026",
      expiryDate: "18 Apr 2026",
      status: "Active",
      isPinned: false
    },
    {
      id: "ANN003",
      title: "Semester Exam Schedule Out",
      category: "Notice",
      audience: "Final Year",
      startDate: "10 Mar 2026",
      expiryDate: "15 Mar 2026",
      status: "Expired",
      isPinned: false
    },
    {
      id: "ANN004",
      title: "Google Cloud Internship Workshop",
      category: "Placement",
      audience: "CSE / ECE",
      startDate: "22 Mar 2026",
      expiryDate: "28 Mar 2026",
      status: "Active",
      isPinned: false
    }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case "Active": return "bg-green-500 text-white border-green-600 shadow-sm";
      case "Expired": return "bg-gray-100 text-gray-400 border-gray-200";
      default: return "bg-white text-gray-400 border-gray-200";
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case "Placement": return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "Event": return "bg-purple-100 text-purple-700 border-purple-200";
      case "Notice": return "bg-orange-100 text-orange-700 border-orange-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Announcements</h2>
          <p className="text-gray-500 font-medium mt-1">Create and manage important updates for students and recruiters.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95">
          <Plus className="w-5 h-5" /> Create Announcement
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl py-4 px-5 shadow-sm border border-gray-100 flex items-center gap-4 group hover:-translate-y-1.5 hover:shadow-xl hover:border-green-100 transition-all duration-300 cursor-default relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-50/50 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
            <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-current/10 relative z-10`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] shrink-0">{stat.title}</p>
              <h4 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap items-end gap-4 transition-all hover:shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 flex-1">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Audience</label>
            <div className="relative group">
              <select className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                <option>All Students</option>
                <option>CSE Students</option>
                <option>Final Year</option>
                <option>Recruiters</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-green-500 transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Category</label>
            <div className="relative group">
              <select className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                <option>All Categories</option>
                <option>Placement</option>
                <option>Event</option>
                <option>Notice</option>
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-green-500 transition-colors" />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Date Filter</label>
            <div className="relative group">
              <input 
                type="date" 
                className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all text-sm font-bold text-gray-700 cursor-pointer"
              />
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-green-500 transition-colors" />
            </div>
          </div>
        </div>
        
        <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-100 text-green-700 font-bold rounded-2xl hover:bg-green-50 hover:border-green-200 transition-all shadow-sm group active:scale-95">
          <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" /> Export
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-300 group-focus-within:text-green-500 transition-all duration-300">
            <Search className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-16 pr-6 py-4 bg-white border-2 border-gray-100 rounded-3xl outline-none focus:border-green-500 focus:ring-[6px] focus:ring-green-500/5 focus:shadow-xl transition-all duration-300 text-sm font-semibold placeholder:text-gray-300"
          />
        </div>
        <button className="px-8 py-4 bg-gray-900 text-white font-bold rounded-3xl hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap">
          Search
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-6">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative group hover:shadow-md hover:border-green-100 transition-all duration-300 animate-in slide-in-from-bottom-2">
            {ann.isPinned && (
              <div className="absolute top-6 left-0 w-1 bg-green-600 h-12 rounded-r-full shadow-[2px_0_8px_rgba(22,163,74,0.4)]"></div>
            )}
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-green-700 transition-colors uppercase tracking-tight">
                    {ann.title}
                  </h3>
                  {ann.isPinned && <Pin className="w-4 h-4 text-green-600 fill-green-600 rotate-45" />}
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${getCategoryStyle(ann.category)}`}>
                    <Tag className="w-3 h-3" />
                    {ann.category}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-gray-200/50 flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {ann.audience}
                  </span>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-100/50 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    Expires: {ann.expiryDate}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-50">
                <div className="flex flex-col items-end gap-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${getStatusStyle(ann.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ann.status === "Active" ? "bg-white animate-pulse" : "bg-gray-300"}`}></span>
                    {ann.status}
                  </span>
                </div>

                <div className="relative">
                  <button 
                    onClick={() => toggleMenu(ann.id)}
                    className={`p-3 rounded-2xl transition-all duration-200 ${activeMenu === ann.id ? "bg-green-600 text-white shadow-lg" : "text-gray-400 hover:text-green-600 hover:bg-green-50"}`}
                  >
                    <MoreVertical className="w-6 h-6" />
                  </button>

                  {/* Actions Dropdown */}
                  {activeMenu === ann.id && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] animate-in slide-in-from-top-2 fade-in duration-200 divide-y divide-gray-50 overflow-hidden">
                      <button className="w-full px-5 py-4 text-left text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors">
                        <Eye className="w-4 h-4" /> View Details
                      </button>
                      <button className="w-full px-5 py-4 text-left text-xs font-bold text-gray-600 hover:bg-green-50 hover:text-green-700 flex items-center gap-3 transition-colors">
                        <Edit2 className="w-4 h-4" /> Edit Announcement
                      </button>
                      <button className="w-full px-5 py-4 text-left text-xs font-bold text-green-600 hover:bg-green-50 flex items-center gap-3 transition-colors">
                        <Pin className="w-4 h-4" /> Pin to Top
                      </button>
                      <button className="w-full px-5 py-4 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <span>Start Date: <span className="text-gray-600">{ann.startDate}</span></span>
              <span className="hidden sm:inline text-gray-200">|</span>
              <span>ID: <span className="text-gray-600">{ann.id}</span></span>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Showing <span className="text-gray-900">1 to 4</span> of 128 announcements
        </p>
        <div className="flex items-center gap-3">
          <button className="p-2.5 border-2 border-gray-100 rounded-xl hover:bg-white text-gray-400 transition-all cursor-not-allowed">
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[1, 2, 3].map((page) => (
            <button key={page} className={`w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black transition-all ${
              page === 1 ? "bg-green-600 text-white shadow-lg shadow-green-600/30" : "border-2 border-gray-100 text-gray-600 hover:bg-green-50 hover:border-green-200 whitespace-nowrap"
            }`}>
              {page}
            </button>
          ))}
          <span className="text-gray-400 px-1 font-bold">...</span>
          <button className="p-2.5 border-2 border-gray-100 rounded-xl hover:bg-green-50 hover:text-green-600 hover:border-green-200 text-gray-600 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
