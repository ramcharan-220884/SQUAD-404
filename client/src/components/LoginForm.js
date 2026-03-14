import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loginUser } from "../services/authService";

const LoginForm = ({ onSuccess, onSwitchToRegister, initialRole = "student" }) => {
  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");



    setLoading(true);

    try {
      const response = await loginUser({ email, password, role });

      if (response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("userRole", response.user.role);
        localStorage.setItem("userId", response.user.id);
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
      <div className="flex bg-gray-100/80 p-1.5 rounded-2xl mb-10 w-full backdrop-blur-sm border border-gray-200/50">
        {["student", "admin", "company"].map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => handleRoleChange(r)}
            className={`flex-1 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] text-center transition-all duration-300 rounded-xl ${role === r
                ? "bg-[#800000] text-white shadow-md scale-100"
                : "bg-transparent text-gray-400 hover:text-gray-600 hover:bg-white/60 scale-95"
              }`}
          >
            {r === "company" ? "Recruiter" : r}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-100 text-red-600 px-4 py-3.5 rounded-2xl shadow-sm mb-8 text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="space-y-2.5">
          <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1">
            {role === "admin" ? "Admin Email or Username" : "Email Address"}
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#800000] transition-colors duration-300">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type={role === "admin" ? "text" : "email"}
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-12 w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100/80 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-[#800000]/5 focus:border-[#800000] outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
              placeholder={role === "admin" ? "e.g. admin@eduvate.com" : "e.g. name@example.com"}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#800000] transition-colors duration-300">
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
              className="pl-12 w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100/80 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-[#800000]/5 focus:border-[#800000] outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end mt-2">
            <button type="button" className="text-[11px] font-bold text-[#800000] hover:text-[#4a0000] transition-colors uppercase tracking-wider">
              Forgot Password?
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4.5 px-6 rounded-2xl text-white text-sm font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-[#800000]/20 transition-all active:scale-[0.98] ${loading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-gradient-to-r from-[#800000] to-[#4a0000] hover:shadow-2xl hover:shadow-[#800000]/30 hover:-translate-y-1"
            }`}
          style={{ padding: '1.125rem' }}
        >
          {loading ? "Verifying..." : role === "admin" ? "Login as Admin" : "Login to Portal"}
        </button>

        {role !== "admin" && (
          <p className="mt-5 text-center text-[12px] text-gray-400 font-medium">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => onSwitchToRegister(role)}
              className="text-[#800000] font-bold hover:underline transition-colors"
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
