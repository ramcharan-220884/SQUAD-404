import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
        localStorage.setItem("userRole", response.user.role);
        localStorage.setItem("userId", response.user.id);
      }

      if (response.user.role === "student") {
        navigate("/student-dashboard");
      } else if (response.user.role === "company") {
        navigate("/company-dashboard");
      } else if (response.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        setError("Invalid user role provided by server.");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center py-4 px-4 relative font-sans overflow-hidden"
    >
      {/* Background with blur and light overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
          filter: "blur(4px)"
        }}
      ></div>
      <div className="absolute inset-0 z-0 bg-white/60"></div>

      <div className="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden relative z-10 p-5 border border-gray-100 flex flex-col justify-center">
        
        {/* Logo and Branding */}
        <div className="flex items-center justify-center mb-3 gap-2">
          {/* Shield SVG with Academic Cap inside */}
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#346b41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Academic cap inside */}
            <path d="M12 8.5L7 11l5 2.5 5-2.5-5-2.5z" stroke="#346b41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
            <path d="M9 12v3c0 1.5 3 2.5 3 2.5s3-1 3-2.5v-3" stroke="#346b41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          <h1 className="text-xl font-extrabold text-[#052c42] tracking-wider">UPMS</h1>
        </div>

        {/* Role Tabs */}
        <div className="flex border border-gray-800 rounded-lg overflow-hidden mb-3 w-full">
          <button
            type="button"
            onClick={() => handleRoleChange("student")}
            className={`flex-1 py-1 text-xs font-semibold text-center transition-colors border-r border-gray-800 ${
              role === "student" ? "bg-[#166534] text-white" : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={`flex-1 py-1 text-xs font-semibold text-center transition-colors border-r border-gray-800 ${
              role === "admin" ? "bg-[#166534] text-white" : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("company")}
            className={`flex-1 py-1 text-xs font-semibold text-center transition-colors ${
              role === "company" ? "bg-[#166534] text-white" : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Recruiter
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-md mb-2 text-[10px] font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-0.5">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* Envelope Icon */}
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-9 w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#22c55e] focus:border-[#22c55e] outline-none transition-colors text-sm"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-0.5">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* Lock Icon */}
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-9 w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#22c55e] focus:border-[#22c55e] outline-none transition-colors text-sm"
                placeholder=""
              />
            </div>
            <div className="flex justify-end mt-1">
              <button type="button" className="text-[10px] font-bold text-[#22c55e] hover:underline bg-transparent border-none p-0 cursor-pointer">
                Forgot Password?
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white text-sm font-bold transition-colors ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#22c55e] hover:bg-[#16a34a]"
            } mt-1`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>

      {/* Footer Text below Card */}
      <div className="mt-3 text-center z-10 flex flex-col gap-0.5 items-center">
        <p className="text-gray-900 font-bold text-[13px]">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#22c55e] font-bold hover:underline">
            Sign Up
          </Link>
        </p>
        <p className="text-gray-900 font-bold text-[11px]">
          Student <Link to="/register?role=student" className="text-[#22c55e] hover:underline">Sign Up</Link> or Recruiter <Link to="/register?role=company" className="text-[#22c55e] hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}