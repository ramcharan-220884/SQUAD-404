import React, { useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import { forgotPasswordAPI } from '../services/authService';

export default function ForgotPasswordModal({ isOpen, onClose, role = 'student' }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { showNotification } = useNotification();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPasswordAPI(email, role);
      setIsSuccess(true);
      showNotification("If your email is registered, a reset link has been sent.", "success");
    } catch (err) {
      showNotification(err.message || "Too many requests. Try again later.", "warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full bg-gray-100/50 hover:bg-gray-100 text-gray-400 font-bold text-xl transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-xl font-black text-[#052c42] mb-2 font-['Poppins'] text-center">Reset Password</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest text-center mb-6">Secure Recovery</p>

        {isSuccess ? (
           <div className="text-center bg-green-50 text-green-700 p-6 rounded-2xl border border-green-200 font-bold mb-4">
              Check your inbox (and spam folder) for the secure link!
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-[#052c42] uppercase tracking-[0.2em] ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50/50 border-2 border-gray-100/80 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium"
                placeholder={role === 'student' ? 'e.g. n220884@rguktn.ac.in' : 'e.g. recruiter@company.com'}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full rounded-2xl text-white text-sm font-extrabold uppercase tracking-[0.15em] shadow-xl transition-all active:scale-[0.98] py-4 mt-2 ${
                loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-red-600 to-rose-600 hover:shadow-2xl hover:shadow-red-500/30 hover:-translate-y-0.5'
              }`}
            >
              {loading ? "Sending link..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
