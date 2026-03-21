import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/authService";
import { setAccessToken } from "../services/api";

const LoginForm = ({ onSuccess, onSwitchToRegister, initialRole = "student", onRoleChange, onForgotPassword }) => {
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const themeStyles = {
    student: {
      tabActive: "bg-[#800000] text-white shadow-md scale-100",
      buttonBg: "bg-gradient-to-r from-[#a00000] to-[#800000] hover:shadow-2xl hover:shadow-[#a00000]/30 hover:-translate-y-1",
      buttonShadow: "shadow-xl shadow-[#a00000]/20",
      iconFocus: "group-focus-within:text-[#a00000]",
      inputFocus: "focus:ring-[#a00000]/5 focus:border-[#a00000]",
      linkColor: "text-[#a00000] hover:text-[#800000]"
    },
    admin: {
      tabActive: "bg-[#166534] text-white shadow-md scale-100",
      buttonBg: "bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:shadow-2xl hover:shadow-[#22c55e]/30 hover:-translate-y-1",
      buttonShadow: "shadow-xl shadow-[#22c55e]/20",
      iconFocus: "group-focus-within:text-[#22c55e]",
      inputFocus: "focus:ring-[#22c55e]/5 focus:border-[#22c55e]",
      linkColor: "text-[#22c55e] hover:text-[#16a34a]"
    },
    company: {
      tabActive: "bg-[#1e40af] text-white shadow-md scale-100",
      buttonBg: "bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:shadow-2xl hover:shadow-[#3b82f6]/30 hover:-translate-y-1",
      buttonShadow: "shadow-xl shadow-[#3b82f6]/20",
      iconFocus: "group-focus-within:text-[#3b82f6]",
      inputFocus: "focus:ring-[#3b82f6]/5 focus:border-[#3b82f6]",
      linkColor: "text-[#3b82f6] hover:text-[#2563eb]"
    }
  };

  const theme = themeStyles[role] || themeStyles.student;

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
    if (onRoleChange) onRoleChange(newRole);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      const response = await loginUser({ email, password, role });

      if (response.accessToken) {
        setAccessToken(response.accessToken);
        localStorage.setItem("userRole", response.user.role);
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userName", response.user.name || "Student");
        localStorage.setItem("userEmail", response.user.email);
      }

      if (onSuccess) {
        onSuccess(response.user.role);
      }
    } catch (err) {
      setError(err.message || "Login failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full font-['Poppins']">
      {/* Role Tabs */}
      <div className="flex bg-gray-100/80 p-1.25 rounded-xl mb-6 w-full backdrop-blur-sm border border-gray-200/50">
        {["student", "admin", "company"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleRoleChange(r)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-center transition-all duration-300 rounded-xl ${role === r
                ? theme.tabActive
                : "bg-transparent text-gray-400 hover:text-gray-600 hover:bg-white/60 scale-95"
              }`}
          >
            {r === "company" ? "Recruiter" : r}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 text-red-600 px-4 py-2.5 rounded-2xl shadow-sm mb-5 text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1">
            {role === "admin" ? "Admin Email or Username" : "Email Address"}
          </label>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 transition-colors duration-300 ${theme.iconFocus}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`pl-11 w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300 ${theme.inputFocus}`}
              placeholder={role === "admin" ? "e.g. admin@pms.com" : "e.g. name@example.com"}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1">Password</label>
          <div className="relative group">
            <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 transition-colors duration-300 ${theme.iconFocus}`}>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`pl-11 w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300 ${theme.inputFocus}`}
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" onClick={onForgotPassword} className={`text-[11px] font-bold transition-colors uppercase tracking-wider ${theme.linkColor}`}>
              Forgot Password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-5 py-3.5 rounded-xl text-white text-sm font-extrabold uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${
            loading
              ? "bg-gray-300 cursor-not-allowed"
              : `${theme.buttonBg} ${theme.buttonShadow}`
            }`}
        >
          {loading ? "Verifying..." : role === "admin" ? "Login as Admin" : "Login to Portal"}
        </button>

        {role !== "admin" && (
          <p className="mt-4 text-center text-[11px] text-gray-400 font-medium">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => onSwitchToRegister(role)}
              className={`font-bold hover:underline transition-colors ${theme.linkColor}`}
            >
              Sign Up
            </button>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginForm;
