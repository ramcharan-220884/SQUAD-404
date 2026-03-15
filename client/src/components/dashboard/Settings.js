import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Save,
  User,
  Building,
  Mail,
  Phone,
  Calendar,
  Layers,
  Shield,
  Bell,
  Lock,
  Key,
  Clock,
  ChevronRight,
  CheckCircle2,
  Globe,
  Users
} from "lucide-react";

export default function Settings() {
  const [notifications, setNotifications] = useState({
    email: true,
    placement: true,
    events: false,
    dashboard: true,
  });

  const [permissions, setPermissions] = useState({
    manageStudents: true,
    manageCompanies: true,
    postAnnouncements: true,
    manageDrives: false,
  });

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const togglePermission = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h2>
          <p className="text-gray-500 font-medium mt-1">Configure system preferences and manage administrative controls.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95">
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Row 1: General Settings (Full Width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">General Settings</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">System Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <SettingsIcon className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    defaultValue="EDUVATE Portal"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">College Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Building className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    defaultValue="National Institute of Technology"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Admin Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    defaultValue="admin@nit.edu"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Contact Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    defaultValue="+91-800-226-7871"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Academic Settings (Left) and User Roles (Right) */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Academic Settings</h3>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Current Academic Year</label>
              <select className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                <option>2024 – 2025</option>
                <option>2023 – 2024</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Semester</label>
                <select className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                  <option>Even Semester</option>
                  <option>Odd Semester</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Placement Season</label>
                <select className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                  <option>Active</option>
                  <option>On Hold</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">User Roles & Permissions</h3>
          </div>

          <div className="space-y-6">
            <div className="flex flex-wrap gap-4 mb-8">
              {["Admin", "Placement Officer", "Student"].map((role) => (
                <button key={role} className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                  role === "Admin" ? "bg-purple-600 text-white border-purple-700 shadow-md" : "bg-white text-gray-500 border-gray-200 hover:border-purple-300 hover:text-purple-600"
                }`}>
                  {role}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Manage Students", key: "manageStudents" },
                { label: "Manage Companies", key: "manageCompanies" },
                { label: "Post Announcements", key: "postAnnouncements" },
                { label: "Manage Drives", key: "manageDrives" }
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group transition-all hover:bg-white hover:border-purple-200">
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                  <button 
                    onClick={() => togglePermission(key)}
                    className={`w-12 h-6 rounded-full transition-all relative ${permissions[key] ? "bg-purple-600" : "bg-gray-200"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permissions[key] ? "left-7" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Notification Preferences (Left) and Security (Right) */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Notification Preferences</h3>
          </div>

          <div className="space-y-4">
            {[
              { label: "Email Notifications", desc: "Send summary reports via email", key: "email" },
              { label: "Placement Alerts", desc: "Instant alerts for new drive registrations", key: "placement" },
              { label: "Event Notifications", desc: "Updates about workshops and talks", key: "events" },
              { label: "Dashboard Alerts", desc: "In-app notifications for admins", key: "dashboard" }
            ].map(({ label, desc, key }) => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{desc}</p>
                </div>
                <button 
                  onClick={() => toggleNotification(key)}
                  className={`w-12 h-6 rounded-full transition-all relative ${notifications[key] ? "bg-orange-500" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[key] ? "left-7" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Security & Authentication</h3>
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-white transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-red-500 shadow-sm border border-gray-100 transition-colors">
                  <Key className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-700">Change Admin Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors" />
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-white transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-red-500 shadow-sm border border-gray-100 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-700">Two Factor Authentication</span>
              </div>
              <span className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">Disabled</span>
            </button>

            <button className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-white transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-red-500 shadow-sm border border-gray-100 transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-700">Session Timeout</span>
              </div>
              <span className="text-xs font-bold text-gray-500">30 Mins</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
        <p>Last login: 15 Mar 2026, 14:30 PM (via Delhi, India)</p>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>System status: Optimal</span>
        </div>
      </div>
    </div>
  );
}
