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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120] flex items-center justify-center p-2 overflow-hidden">
      <div className="bg-white rounded-2xl w-full max-w-md p-5 my-auto relative shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-hidden">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100/50 hover:bg-gray-100 text-gray-400 font-bold text-lg transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-xl font-black text-[#052c42] mb-1 font-['Poppins'] text-center leading-tight">Reset Password</h2>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest text-center mb-3">Secure Recovery</p>

        {isSuccess ? (
           <div className="text-center bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-bold text-xs">
              Check your inbox for the link!
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-[10px] font-extrabold text-[#052c42] uppercase tracking-wider ml-1">Email Address</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50/50 border-2 border-gray-100/80 rounded-xl focus:bg-white focus:ring-[4px] focus:ring-violet-500/5 focus:border-violet-500 outline-none transition-all duration-300 text-sm font-medium"
                placeholder={role === 'student' ? 'e.g. n220884@rguktn.ac.in' : 'e.g. recruiter@company.com'}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full rounded-xl text-white text-xs font-extrabold uppercase tracking-wider shadow-lg transition-all active:scale-[0.98] py-2.5 mt-1 ${
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
