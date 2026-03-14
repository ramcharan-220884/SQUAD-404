import React from 'react';
import LoginForm from './LoginForm';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, initialRole = "student" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300 relative border border-white/20 flex flex-col h-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100/50 hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-all z-10"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex-1 p-6 lg:p-8 font-['Poppins']">
          <div className="mb-10 flex flex-col items-center text-center">
            {/* Eduvate Logo */}
            <div className="flex items-center justify-center mb-8 gap-4 px-4 py-2 rounded-2xl bg-gray-50/50 border border-gray-100/50">
              <div className="w-14 h-14 bg-gradient-to-tr from-[#346b41] to-[#4caf50] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#346b41]/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black text-[#052c42] leading-none tracking-tight">EDUVATE</h1>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1.5">Student Innovation Hub</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#346b41]/5 text-[#346b41] text-[11px] font-extrabold uppercase tracking-[0.2em] mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346b41] animate-pulse"></span>
              Secure Portal Access
            </div>
          </div>

          <LoginForm
            initialRole={initialRole}
            onSuccess={(role) => {
              onClose();
              // Programmatic redirection based on role
              if (role === "student") {
                window.location.href = "/student-dashboard";
              } else if (role === "admin") {
                window.location.href = "/admin-dashboard";
              } else if (role === "company") {
                window.location.href = "/company-dashboard";
              }
            }}
            onSwitchToRegister={(role) => {
              onClose();
              onSwitchToRegister(role);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
