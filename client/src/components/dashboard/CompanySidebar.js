import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  Bell,
  LogOut,
  Trophy,
  Calendar
} from "lucide-react";

export default function CompanySidebar({ activeTab, setActiveTab }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const sidebarItems = [
    { name: "Home", icon: LayoutDashboard },
    { name: "Posted Jobs", icon: Briefcase },
    { name: "Applications", icon: FileText },
    { name: "Students", icon: Users },
    { name: "Analytics", icon: BarChart2 },
    { name: "Announcements", icon: Bell },
    { name: "Competitions", icon: Trophy },
    { name: "Events", icon: Calendar },
    { name: "Assessments", icon: FileText },
    { name: "Settings", icon: Settings },
    { name: "Help & Support", icon: HelpCircle },
    { name: "Logout", icon: LogOut, isAction: true },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    window.location.href = "/";
  };

  return (
    <>
      <aside className="w-72 bg-[#0f172a] flex flex-col py-6 z-10 shrink-0 shadow-xl relative overflow-hidden">
        <div className="px-6 pb-6 flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 ring-2 ring-white/10">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-white leading-none tracking-tight">EDUVATE</h1>
            <p className="text-[9px] font-bold text-blue-400 uppercase tracking-widest mt-1">Company Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-0.5 flex flex-col">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            const isSupportItem = item.name === "Help & Support";
            
            return (
              <React.Fragment key={item.name}>
                {isSupportItem && (
                  <div className="px-3 mt-4 mb-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Support</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (item.name === "Logout") {
                      setShowLogoutModal(true);
                    } else if (setActiveTab) {
                      setActiveTab(item.name);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                    isActive 
                      ? "bg-[#3b82f6] text-white shadow-md shadow-blue-500/20 font-bold" 
                      : item.name === "Logout" 
                        ? "text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium" 
                        : "text-gray-400 hover:bg-white/5 hover:text-white font-medium"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? "text-white" : item.name === "Logout" ? "text-red-400 group-hover:text-red-300" : "text-gray-400 group-hover:text-white"
                  }`} />
                  {item.name}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </aside>

      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden p-8 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-4 bg-red-50 rounded-2xl mb-4 text-red-600">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Log Out</h3>
            </div>
            <p className="text-gray-600 text-sm text-center mb-8 font-medium leading-relaxed">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex flex-row gap-4">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 shadow-sm"
              >
                No
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-blue-600/20 active:scale-95"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
