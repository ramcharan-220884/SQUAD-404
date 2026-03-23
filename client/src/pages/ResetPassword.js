import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { resetPasswordAPI } from '../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Fallback if accessed without strict token parameters automatically appended in the SMTP URL
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-['Poppins']">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-lg text-center animate-in fade-in zoom-in">
          <h2 className="text-2xl font-black text-red-600 mb-2">Invalid Link</h2>
          <p className="text-gray-500 font-medium text-sm">This password reset link is invalid or malformed.</p>
        </div>
      </div>
    );
  }

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 8) return showNotification("Password must be at least 8 characters long.", "warning");

    const strongPassword = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(password)) return showNotification("Password must include at least one number and one special character (e.g. !@#$).", "warning");

    if (password !== confirmPassword) return showNotification("Passwords do not match.", "error");

    setLoading(true);
    try {
      await resetPasswordAPI(token, password);
      showNotification("Password successfully reset! You can now log in.", "success");
      navigate("/");
    } catch (err) {
      showNotification(err.message || "Reset link expired or invalid. Please request a new one.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center p-2 font-['Poppins'] overflow-hidden">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-white/40 my-2">
        
        {/* Branding Header */}
        <div className="bg-gradient-to-tr from-[#346b41] to-[#4caf50] p-5 text-center text-white relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <h1 className="text-xl font-black tracking-tight relative z-10">EDUVATE</h1>
          <p className="opacity-80 font-bold mt-0.5 uppercase tracking-widest text-[9px] relative z-10">Secure Recovery</p>
        </div>

        {/* Reset Form */}
        <div className="p-5">
          <h2 className="text-lg font-black text-[#052c42] mb-3 text-center leading-tight">Create New Password</h2>
          <form onSubmit={handleResetSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">New Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-[#346b41]/10 focus:border-[#346b41] outline-none transition-all duration-300 text-sm font-medium"
                placeholder="Min 8 chars, with a number & special char"
              />
              <p className="text-[8px] text-gray-400 font-medium ml-1">Min 8 chars, include a number & special char</p>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Confirm Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-[#346b41]/10 focus:border-[#346b41] outline-none transition-all duration-300 text-sm font-medium"
                placeholder="Confirm your password"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full rounded-xl text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] py-2.5 mt-1 ${
                loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-[#346b41] to-[#4caf50] hover:shadow-2xl hover:shadow-[#346b41]/30 hover:-translate-y-0.5'
              }`}
            >
              {loading ? "Processing..." : "Reset Password"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
