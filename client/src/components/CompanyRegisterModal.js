import React, { useState, useRef, useEffect } from 'react';

import { useNotification } from '../context/NotificationContext';
import { registerUser, googleLoginAPI, sendOTPAPI } from '../services/authService';
import { GoogleLogin } from '@react-oauth/google';

const CompanyRegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const { showNotification } = useNotification();
  const [step, setStep] = useState(1); // 1 = form, 2 = OTP
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Reset state when modal closes/opens
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setOtp(['', '', '', '', '', '']);
      setError('');
      setResendCooldown(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      showNotification("Creating Company Profile...", "info");
      const response = await googleLoginAPI(credentialResponse.credential, 'company');
      
      localStorage.setItem("userRole", response.user.role);
      localStorage.setItem("userId", response.user.id);
      localStorage.setItem("userName", response.user.name);
      localStorage.setItem("userEmail", response.user.email);
      
      showNotification(`Welcome, ${response.user.name}! Profile sent for approval.`, "success");
      onClose();
      window.location.href = "/company-dashboard";
    } catch (err) {
      showNotification(err.message || "Google Sign-Up failed.", "error");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Step 1: Validate form & send OTP
  const handleSendOTP = async (e) => {
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
      await sendOTPAPI(formData.email);
      setStep(2);
      setResendCooldown(60);
      showNotification("Verification code sent to your email!", "success", "company");
    } catch (err) {
      const msg = err.message || 'Failed to send verification code.';
      setError(msg);
      showNotification(msg, "error", "company");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: formData.companyName,
        email: formData.email,
        password: formData.password,
        role: 'company',
        otp: otpString,
      });
      showNotification("Registration successful! Your account is pending admin approval.", "success", "company");
      onClose();
    } catch (err) {
      const msg = err.message || 'Verification failed.';
      setError(msg);
      showNotification(msg, "error", "company");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setError('');
    setOtp(['', '', '', '', '', '']);
    setLoading(true);
    try {
      await sendOTPAPI(formData.email);
      setResendCooldown(60);
      showNotification("New verification code sent!", "success", "company");
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setLoading(false);
    }
  };

  // OTP input handling
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only last char
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  // Common modal wrapper
  const renderModalWrapper = (children) => (
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
              {step === 1 ? 'Company Sign Up' : 'Email Verification'}
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );

  // ── STEP 2: OTP Verification ──────────────────────────────────────────────
  if (step === 2) {
    return renderModalWrapper(
      <>
        <div className="text-center mb-3">
          <div className="w-10 h-10 mx-auto mb-2 bg-violet-50 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-xs text-gray-500 font-medium">
            We've sent a 6-digit code to
          </p>
          <p className="text-[12px] font-bold text-[#052c42] mt-0.5">{formData.email}</p>
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

        <form onSubmit={handleVerifyAndRegister}>
          {/* OTP Input Boxes */}
          <div className="flex justify-center gap-2 mb-4" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (otpRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-10 h-11 text-center text-lg font-bold bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300"
                autoFocus={index === 0}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.join('').length !== 6}
            className={`w-full rounded-xl text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] ${
              loading || otp.join('').length !== 6
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5'
            }`}
            style={{ padding: '0.75rem' }}
          >
            {loading ? 'Verifying...' : 'Verify & Create Account'}
          </button>

          {/* Resend & Back */}
          <div className="mt-2 flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => { setStep(1); setError(''); setOtp(['', '', '', '', '', '']); }}
              className="text-[10px] text-gray-400 font-medium hover:text-gray-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resendCooldown > 0 || loading}
              className={`text-[10px] font-bold transition-colors ${
                resendCooldown > 0 ? 'text-gray-300 cursor-not-allowed' : 'text-violet-600 hover:underline'
              }`}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </button>
          </div>
        </form>
      </>
    );
  }

  // ── STEP 1: Registration Form ─────────────────────────────────────────────
  return renderModalWrapper(
    <>
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
      <form onSubmit={handleSendOTP} className="space-y-2">
        {/* Company Name */}
        <div className="space-y-0.5">
          <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Company Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
              className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-0.5">
          <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
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
              placeholder="e.g. recruiter@company.com"
              className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-0.5">
          <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
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
              className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
            />
          </div>
          <p className="text-[8px] text-gray-400 font-medium ml-1">Min 8 chars, include a number & special char</p>
        </div>

        {/* Confirm Password */}
        <div className="space-y-0.5">
          <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Confirm Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300 group-focus-within:text-violet-500 transition-colors duration-300">
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
              className="pl-10 w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium placeholder:text-gray-300"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full rounded-xl text-white text-xs font-extrabold uppercase tracking-wider shadow-lg shadow-violet-500/20 transition-all active:scale-[0.98] ${loading
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-0.5'
            }`}
          style={{ padding: '0.75rem' }}
        >
          {loading ? 'Sending Code...' : 'Continue'}
        </button>

        <p className="mt-2 text-center text-[10px] text-gray-400 font-medium">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-violet-600 font-bold hover:underline transition-colors"
          >
            Login
          </button>
        </p>

      </form>
    </>
  );
};

export default CompanyRegisterModal;
