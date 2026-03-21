import React, { useState, useEffect } from "react";
import { registerStudent } from "../services/studentService";
import { registerCompany } from "../services/companyService";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useNotification } from '../context/NotificationContext';

export default function Register() {
  const [role, setRole] = useState("student");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();

  useEffect(() => {
    // Check if the URL has ?role=company
    const searchParams = new URLSearchParams(location.search);
    const roleParam = searchParams.get('role');
    if (roleParam === 'company' || roleParam === 'student') {
      setRole(roleParam);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (role === "student") {
        await registerStudent({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else if (role === "company") {
        await registerCompany({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          description: formData.description,
        });
      } else if (role === "admin") {
        setError("Admin registration is restricted. Please contact IT.");
        setLoading(false);
        return;
      }

      showNotification("Registration successful! Please login.", "success", "student");
      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-10 px-4 relative font-sans"
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

      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden relative z-10 p-8 border border-gray-100 mt-6 mb-6">
        
        {/* Logo and Branding */}
        <div className="flex items-center justify-center mb-6 gap-2">
          {/* Shield SVG with Academic Cap inside */}
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#800000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8.5L7 11l5 2.5 5-2.5-5-2.5z" stroke="#800000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="currentColor"/>
            <path d="M9 12v3c0 1.5 3 2.5 3 2.5s3-1 3-2.5v-3" stroke="#800000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h1 className="text-3xl font-extrabold text-[#052c42] tracking-wider">UPMS</h1>
        </div>

        {/* Role Tabs */}
        <div className="flex border border-gray-800 rounded-lg overflow-hidden mb-6 w-full">
          <button
            type="button"
            onClick={() => handleRoleChange("student")}
            className={`flex-1 py-1.5 text-sm font-semibold text-center transition-colors border-r border-gray-800 ${
              role === "student" ? "bg-[#800000] text-white" : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("admin")}
            className={`flex-1 py-1.5 text-sm font-semibold text-center transition-colors border-r border-gray-800 ${
              role === "admin" ? "bg-[#800000] text-white" : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange("company")}
            className={`flex-1 py-1.5 text-sm font-semibold text-center transition-colors ${
              role === "company" ? "bg-[#800000] text-white" : "bg-white text-gray-800 hover:bg-gray-50"
            }`}
          >
            Recruiter
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">
              {role === "company" ? "Company/Organization Name" : "Full Name"}
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-none transition-colors"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-none transition-colors"
                placeholder=""
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-none transition-colors"
                placeholder=""
              />
            </div>
          </div>

          {role === "company" && (
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#800000] focus:border-[#800000] outline-none transition-colors resize-none"
              ></textarea>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 px-4 rounded-md text-white font-medium transition-colors ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#800000] hover:bg-[#4a0000]"
            } mt-2`}
          >
            {loading ? "Registering..." : `Register as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
          </button>
        </form>
      </div>

      {/* Footer Text below Card */}
      <div className="absolute bottom-6 w-full text-center z-10 flex flex-col gap-1 items-center">
        <p className="text-gray-900 font-medium text-[15px]">
          Already have an account?{" "}
          <Link to="/login" className="text-[#800000] font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}