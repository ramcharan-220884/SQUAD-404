import React, { useState } from 'react';
import { registerUser, googleLoginAPI } from '../services/authService';
import { useNotification } from '../context/NotificationContext';
import { GoogleLogin } from '@react-oauth/google';


const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      showNotification("Creating Profile seamlessly via Google...", "info");
      const response = await googleLoginAPI(credentialResponse.credential, 'student');
      
      if (response && response.success === true) {
        localStorage.setItem("userRole", response.user.role);
        localStorage.setItem("userId", response.user.id);
        localStorage.setItem("userName", response.user.name);
        localStorage.setItem("userEmail", response.user.email);
        
        showNotification(`Welcome, ${response.user.name}! Account created securely.`, "success");
        onClose();
        window.location.href = "/student-dashboard";
      }
    } catch (err) {
      const errMsg = err.message || "Google Sign-Up failed.";
      setError(errMsg);
      showNotification(errMsg, "error");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    const strongPassword = /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!strongPassword.test(formData.password)) {
      setError('Password must include at least one number and one special character (e.g. !@#$).');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: 'student',
      });
      showNotification("Registration successful! Your account is pending admin approval.", "success", "student");
      onClose();
    } catch (err) {
      const msg = err.message?.includes('Validation failed') 
        ? 'Password must be 8+ chars with a number and special character (!@#$)'
        : (err.message || 'Error connecting to server');
      setError(msg);
      showNotification(msg, "error", "student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto relative border border-white/20 animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all z-10"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-5 font-['Poppins']">
          {/* Header */}
          <div className="mb-3 flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-2 gap-3 px-3 py-1.5 rounded-xl bg-gray-50/50 border border-gray-100/50">
              <div className="w-9 h-9 bg-gradient-to-tr from-[#346b41] to-[#4caf50] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#346b41]/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-lg font-black text-[#052c42] leading-none tracking-tight">EDUVATE</h1>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Student Innovation Hub</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#346b41]/5 text-[#346b41] text-[9px] font-extrabold uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-[#346b41] animate-pulse"></span>
              Student Sign Up
            </div>
          </div>

          <div className="w-full flex justify-center mb-3">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => showNotification("Google Sign-Up failed to connect.", "error")}
              theme="outline" 
              size="medium" 
              shape="rectangular"
              text="signup_with"
            />
          </div>

          <div className="flex items-center w-full mb-3">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Or standard signup</span>
            <div className="flex-1 border-t border-gray-200"></div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 px-3 py-1.5 rounded-xl text-[10px] font-semibold flex items-center gap-2 mb-3">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-2.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#346b41] transition-colors duration-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="e.g. John Doe"
                  className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-[#346b41]/5 focus:border-[#346b41] outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#346b41] transition-colors duration-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="e.g. name@example.com"
                  className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-[#346b41]/5 focus:border-[#346b41] outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#346b41] transition-colors duration-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-[#346b41]/5 focus:border-[#346b41] outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Confirm Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-[#346b41] transition-colors duration-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-[#346b41]/5 focus:border-[#346b41] outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-[#346b41]/20 transition-all active:scale-[0.98] ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#346b41] to-[#4caf50] hover:shadow-2xl hover:shadow-[#346b41]/30 hover:-translate-y-0.5'
              }`}
              style={{ padding: '0.75rem' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <p className="mt-2 text-center text-[10px] text-gray-400 font-medium">
              Already have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-[#346b41] font-bold hover:underline transition-colors"
              >
                Login
              </button>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
