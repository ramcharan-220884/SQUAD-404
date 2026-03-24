import React, { useState, useEffect } from "react";
import { getSettings, updateSettings, getProfile, changeAdminPassword } from "../../services/adminService";
import { useNotification } from "../../context/NotificationContext";
import {
  Settings as SettingsIcon, Save, Building, Mail, Phone, Calendar, Layers, Shield,
  Bell, Lock, Key, Clock, ChevronRight, CheckCircle2, Globe, Users, X
} from "lucide-react";

export default function Settings() {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);

  const [notifications, setNotifications] = useState({
    email: true, placement: true, events: false, dashboard: true,
  });

  const [permissions, setPermissions] = useState({
    manageStudents: true, manageCompanies: true, postAnnouncements: true, manageDrives: false,
  });

  const [general, setGeneral] = useState({
    systemName: "EDUVATE Portal",
    collegeName: "National Institute of Technology",
    adminEmail: "admin@nit.edu",
    contactNumber: "+91-800-226-7871"
  });

  const [academic, setAcademic] = useState({
    academicYear: "2024 – 2025",
    semester: "Even Semester",
    placementSeason: "Active"
  });
  
  const [security, setSecurity] = useState({
    sessionTimeout: 30,
    twoFactorEnabled: false
  });

  const [darkMode, setDarkMode] = useState(false);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [data, profile] = await Promise.all([
          getSettings(),
          getProfile().catch(() => null)
        ]);
        
        if (data) {
          setGeneral({
            systemName: data.system_name || "EDUVATE Portal",
            collegeName: data.college_name || "National Institute of Technology",
            adminEmail: data.admin_email || "admin@nit.edu",
            contactNumber: data.contact_number || "+91-800-226-7871"
          });
          setAcademic({
            academicYear: data.academic_year || "2024 – 2025",
            semester: data.semester || "Even Semester",
            placementSeason: data.placement_season || "Active"
          });
          setSecurity({
            sessionTimeout: data.session_timeout || 30,
            twoFactorEnabled: data.two_factor_enabled || false
          });
          if (data.dark_mode) setDarkMode(true);
          if (data.notifications) setNotifications(data.notifications);
          if (data.permissions) setPermissions(data.permissions);
        }
        
        if (profile) {
          setAdminProfile(profile);
          setDarkMode(profile.dark_mode ? true : false);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        showNotification("Failed to load settings", "error", "admin");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [showNotification]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        systemName: general.systemName,
        collegeName: general.collegeName,
        adminEmail: general.adminEmail,
        contactNumber: general.contactNumber,
        academicYear: academic.academicYear,
        semester: academic.semester,
        placementSeason: academic.placementSeason,
        darkMode: darkMode,
        notifications: notifications,
        permissions: permissions,
        sessionTimeout: security.sessionTimeout,
        twoFactorEnabled: security.twoFactorEnabled
      };

      await updateSettings(payload);
      
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      showNotification("Settings saved successfully!", "success", "admin");
    } catch (err) {
      console.error("Failed to save settings:", err);
      showNotification("Failed to save settings", "error", "admin");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showNotification("Passwords do not match", "error", "admin");
    }
    if (passwordForm.newPassword.length < 8) {
      return showNotification("Password must be at least 8 characters", "error", "admin");
    }

    setPasswordSaving(true);
    try {
      await changeAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showNotification("Password changed successfully", "success", "admin");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showNotification(err.message || "Failed to change password", "error", "admin");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleChange = (setter) => (e) => {
    const { name, value } = e.target;
    setter(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Loading settings...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h2>
          <p className="text-gray-500 font-medium mt-1">Configure system preferences and manage administrative controls.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 font-bold rounded-2xl transition-all shadow-lg active:scale-95 ${saving ? "bg-gray-400 text-gray-100 cursor-not-allowed shadow-none" : "bg-green-600 text-white hover:bg-green-700 shadow-green-600/20"}`}
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"/> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Changes"}
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
              {[
                { label: "System Name", name: "systemName", icon: SettingsIcon, type: "text" },
                { label: "College Name", name: "collegeName", icon: Building, type: "text" },
                { label: "Admin Email", name: "adminEmail", icon: Mail, type: "email" },
                { label: "Contact Number", name: "contactNumber", icon: Phone, type: "text" }
              ].map(({ label, name, icon: Icon, type }) => (
                <div key={name} className="flex flex-col gap-2">
                  <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">{label}</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <input 
                      type={type} 
                      name={name}
                      value={general[name]}
                      onChange={handleChange(setGeneral)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-gray-700" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Academic Settings */}
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
              <select name="academicYear" value={academic.academicYear} onChange={handleChange(setAcademic)} className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                <option>2024 – 2025</option>
                <option>2023 – 2024</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Semester</label>
                <select name="semester" value={academic.semester} onChange={handleChange(setAcademic)} className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                  <option>Even Semester</option>
                  <option>Odd Semester</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Placement Season</label>
                <select name="placementSeason" value={academic.placementSeason} onChange={handleChange(setAcademic)} className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 appearance-none text-sm font-bold text-gray-700 cursor-pointer">
                  <option>Active</option>
                  <option>On Hold</option>
                </select>
              </div>
            </div>
          </div>
        </div>


        {/* Row 3: Notifications */}
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
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 cursor-pointer" onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}>
                <div>
                  <p className="text-sm font-bold text-gray-900">{label}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{desc}</p>
                </div>
                <button className={`w-12 h-6 rounded-full transition-all relative ${notifications[key] ? "bg-orange-500" : "bg-gray-200"}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[key] ? "left-7" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Row 3: Security */}
        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Security & Authentication</h3>
          </div>

          <div className="space-y-3">
            <button onClick={() => setShowPasswordModal(true)} className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-white transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-red-500 shadow-sm border border-gray-100 transition-colors">
                  <Key className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-700">Change Admin Password</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 transition-colors" />
            </button>

            <button onClick={() => setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }))} className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-white transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-gray-400 group-hover:text-red-500 shadow-sm border border-gray-100 transition-colors">
                  <Lock className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-700">Two Factor Authentication (2FA)</span>
              </div>
              <div className={`w-10 h-5 rounded-full transition-all relative ${security.twoFactorEnabled ? "bg-red-500" : "bg-gray-200"}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${security.twoFactorEnabled ? "left-5" : "left-1"}`} />
              </div>
            </button>

            <div className="w-full flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl text-gray-400 shadow-sm border border-gray-100 transition-colors">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold text-gray-700">Session Timeout</span>
              </div>
              <select 
                value={security.sessionTimeout} 
                onChange={(e) => setSecurity(prev => ({ ...prev, sessionTimeout: Number(e.target.value) }))}
                className="bg-white border hover:border-red-200 text-xs font-bold text-gray-700 rounded-lg px-2 py-1 outline-none cursor-pointer"
              >
                <option value={15}>15 Mins</option>
                <option value={30}>30 Mins</option>
                <option value={60}>1 Hour</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 4: Permissions (User Roles) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">User Roles & Permissions</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Manage Students", key: "manageStudents" },
                { label: "Manage Companies", key: "manageCompanies" },
                { label: "Post Announcements", key: "postAnnouncements" },
                { label: "Manage Drives", key: "manageDrives" }
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100 cursor-pointer" onClick={() => setPermissions(prev => ({ ...prev, [key]: !prev[key] }))}>
                  <span className="text-sm font-bold text-gray-700">{label}</span>
                  <button className={`w-12 h-6 rounded-full transition-all relative ${permissions[key] ? "bg-purple-600" : "bg-gray-200"}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${permissions[key] ? "left-7" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between pt-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-t border-gray-100">
        <p>Logged in as: {adminProfile?.name || 'Admin'}</p>
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle2 className="w-4 h-4" />
          <span>System status: OK</span>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
            <div className="p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2"><Key className="w-5 h-5 text-red-500"/> Change Password</h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Current Password</label>
                  <input required type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all text-sm font-bold text-gray-700" placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">New Password</label>
                  <input required type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all text-sm font-bold text-gray-700" placeholder="••••••••" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Confirm Password</label>
                  <input required type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl focus:bg-white focus:border-red-500 outline-none transition-all text-sm font-bold text-gray-700" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={passwordSaving} className={`w-full mt-6 py-3 rounded-xl text-white font-bold uppercase tracking-widest transition-all ${passwordSaving ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20 active:scale-95'}`}>
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
