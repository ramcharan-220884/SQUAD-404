import React, { useState } from 'react';
import { registerUser } from '../services/authService';

const CompanyRegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleClose = () => {
    // Reset state on close
    setFormData({ companyName: '', email: '', password: '', confirmPassword: '' });
    setError('');
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: formData.companyName,
        email: formData.email,
        password: formData.password,
        role: 'company',
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300 relative border border-white/20 flex flex-col h-auto">

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all z-10"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 p-6 lg:p-8 font-['Poppins']">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="flex items-center justify-center mb-6 gap-4 px-4 py-2 rounded-2xl bg-gray-50/50 border border-gray-100/50">
              <div className="w-14 h-14 bg-gradient-to-tr from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-violet-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-[#052c42] leading-none tracking-tight">EDUVATE</h1>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1.5">Student Innovation Hub</p>
              </div>
            </div>

            {!isSuccess && (
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-violet-50 text-violet-600 text-[11px] font-extrabold uppercase tracking-[0.2em] mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></span>
                Company Registration
              </div>
            )}
          </div>

          {isSuccess ? (
            <div className="text-center animate-in fade-in zoom-in duration-500 py-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 shadow-lg shadow-green-100">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-[#052c42] mb-3">Registration Successful!</h2>
              <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 px-4">
                Your account has been created and is currently <span className="text-orange-500 font-bold">pending admin approval</span>. You will not be able to log in until your account is approved.
              </p>
              <button
                onClick={() => {
                  handleClose();
                  onSwitchToLogin();
                }}
                className="w-full py-4 px-6 rounded-2xl bg-gray-100 text-gray-700 text-sm font-extrabold uppercase tracking-[0.1em] hover:bg-gray-200 transition-colors"
                style={{ padding: '1.125rem' }}
              >
                Return to Login
              </button>
            </div>
          ) : (
            <>
              {/* Error */}
              {error && (
                <div className="bg-red-50 border-2 border-red-100 text-red-600 px-4 py-3.5 rounded-2xl shadow-sm mb-6 text-xs font-semibold flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Company Name */}
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1">Company Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Acme Corp"
                      className="pl-12 w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100/80 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2.5">
                  <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. recruiter@company.com"
                      className="pl-12 w-full px-5 py-4 bg-gray-50/50 border-2 border-gray-100/80 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                    />
                  </div>
                </div>

                {/* Password Grid */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Password */}
                  <div className="space-y-2.5">
                    <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                      <span>Password</span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="pl-11 w-full px-4 py-4 bg-gray-50/50 border-2 border-gray-100/80 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2.5">
                    <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1 flex items-center justify-between">
                      <span>Confirm <span className="hidden sm:inline">Password</span></span>
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                        className="pl-11 w-full px-4 py-4 bg-gray-50/50 border-2 border-gray-100/80 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4.5 px-6 rounded-2xl text-white text-sm font-extrabold uppercase tracking-[0.2em] shadow-xl shadow-violet-500/20 transition-all active:scale-[0.98] mt-2 ${
                    loading
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-1'
                  }`}
                  style={{ padding: '1.125rem' }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>

                <p className="mt-5 text-center text-[12px] text-gray-400 font-medium">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                        handleClose();
                        onSwitchToLogin();
                    }}
                    className="text-violet-600 font-bold hover:underline transition-colors"
                  >
                    Login to Portal
                  </button>
                </p>

              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyRegisterModal;
