import React, { useState } from 'react';
import { loginUser, googleLoginAPI } from '../services/authService';
import ForgotPasswordModal from './ForgotPasswordModal';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { setAccessToken } from '../services/api';

const CompanyLoginModal = ({ isOpen, onClose, onSwitchToRegister }) => {
  const { showNotification } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      showNotification("Verifying Google Profile...", "info");
      setLoading(true);

      setError('');
      
      const response = await googleLoginAPI(credentialResponse.credential, 'company');
      
      if (response.accessToken) setAccessToken(response.accessToken);
      
      localStorage.setItem('userRole', response.user.role);
      localStorage.setItem('userId', response.user.id);
      localStorage.setItem('userName', response.user.name);
      localStorage.setItem('userEmail', response.user.email);
      
      showNotification(`Welcome back, ${response.user.name}!`, "success");
      onClose();
      navigate("/company-dashboard");
    } catch (err) {
      const errMsg = err.message || 'Google Login failed. Please try again.';
      setError(errMsg);
      showNotification(errMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser({ email, password, role: 'company' });
      if (response.accessToken) {
        setAccessToken(response.accessToken);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userId', response.user.id);
        localStorage.setItem('userName', response.user.name);
        localStorage.setItem('userEmail', response.user.email);
        if (response.user.approved === 1) {
            onClose();
            navigate('/company-dashboard');
          } else {
            showNotification("Your account is awaiting approval.", "warning");
            setAccessToken(null); // Clear token if not approved
            localStorage.clear(); // Clear user data
            setError("Your account is awaiting approval. Please try again later.");
          }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-auto relative border border-white/20 animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all"
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
              <div className="w-9 h-9 bg-gradient-to-tr from-violet-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-lg font-black text-[#052c42] leading-none tracking-tight">EDUVATE</h1>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Student Innovation Hub</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 text-[9px] font-extrabold uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-violet-500 animate-pulse"></span>
              Recruiter Login
            </div>
          </div>

          <div className="w-full flex justify-center mb-3">
            <GoogleLogin 
              onSuccess={handleGoogleSuccess} 
              onError={() => setError("Google Sign-In failed to connect.")}
              theme="outline" 
              size="medium" 
              shape="rectangular"
              text="signin_with"
            />
          </div>

          <div className="flex items-center w-full mb-3">
            <div className="flex-1 border-t border-gray-200"></div>
            <span className="px-3 text-[9px] font-bold text-gray-400 uppercase tracking-widest">Or standard login</span>
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
            {/* Email */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  placeholder="e.g. recruiter@company.com"
                  className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                  placeholder="••••••••"
                  className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-2xl text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5'
              }`}
              style={{ padding: '0.75rem' }}
            >
              {loading ? 'Logging in...' : 'Login to Portal'}
            </button>

            <p className="mt-2 text-center text-[10px] text-gray-400 font-medium">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-violet-600 font-bold hover:underline transition-colors"
              >
                Sign Up
              </button>
            </p>

            <div className="mt-1 text-center">
              <button 
                type="button" 
                onClick={() => setShowForgot(true)} 
                className="text-[10px] font-bold text-gray-400 hover:text-violet-600 transition-colors"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <ForgotPasswordModal isOpen={showForgot} onClose={() => setShowForgot(false)} role="company" />
    </>
  );
};

export default CompanyLoginModal;
