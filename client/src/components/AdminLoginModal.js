import React, { useState } from 'react';
import { loginUser } from '../services/authService';
import { setAccessToken } from '../services/api';
import { useNavigate } from 'react-router-dom';


const AdminLoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await loginUser({ email, password, role: 'admin' });
      if (response.accessToken) {
        setAccessToken(response.accessToken);
        localStorage.setItem('userRole', response.user.role);
        localStorage.setItem('userId', response.user.id);
        onClose();
        navigate('/admin-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
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
              <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-lg font-black text-[#052c42] leading-none tracking-tight">EDUVATE</h1>
                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-0.5">Student Innovation Hub</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-extrabold uppercase tracking-wider">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              Admin Login
            </div>
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
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email / Username */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Admin Email or Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-300">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                  placeholder="e.g. admin@pms.com"
                  className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-emerald-500 transition-colors duration-300">
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
                  className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full rounded-xl text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] ${
                loading
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-0.5'
              }`}
              style={{ padding: '0.75rem' }}
            >
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginModal;
