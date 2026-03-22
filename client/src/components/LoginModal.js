import React from 'react';
import LoginForm from './LoginForm';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { googleLoginAPI } from '../services/authService';
import { setAccessToken } from '../services/api';
import ForgotPasswordModal from './ForgotPasswordModal';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, initialRole = "student" }) => {
  const { showNotification } = useNotification();
  const [showForgot, setShowForgot] = React.useState(false);
  const [currentRole, setCurrentRole] = React.useState(initialRole);
  const [error, setError] = React.useState('');

  const navigate = useNavigate();

  React.useEffect(() => {
    if (isOpen) setCurrentRole(initialRole);
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      showNotification("Verifying Google Credentials...", "info");
      const response = await googleLoginAPI(credentialResponse.credential, currentRole);
      
      if (response.accessToken) {
        setAccessToken(response.accessToken);
      }
      localStorage.setItem("userRole", response.user.role);
      localStorage.setItem("userId", response.user.id);
      localStorage.setItem("userName", response.user.name);
      localStorage.setItem("userEmail", response.user.email);
      showNotification(`Welcome back, ${response.user.name}!`, "success");
      onClose();
      
      const roleRoutes = {
        student: "/student-dashboard",
        company: "/company-dashboard",
        admin: "/admin-dashboard",
      };
      navigate(roleRoutes[response.user.role] || "/");
    } catch (err) {
      const errMsg = err.message || "Google Login failed.";
      setError(errMsg);
      showNotification(errMsg, "error");
    }
  };

  return (
    <>
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

        <div className="flex-1 p-5 lg:p-6 font-['Poppins']">
          <div className="mb-4 flex flex-col items-center text-center">
            {/* Eduvate Logo */}
            <div className="flex items-center justify-center mb-4 gap-3 px-4 py-2 rounded-2xl bg-gray-50/50 border border-gray-100/50">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#346b41] to-[#4caf50] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#346b41]/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-black text-[#052c42] leading-none tracking-tight">EDUVATE</h1>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-1">Student Innovation Hub</p>
              </div>
            </div>

            {(currentRole === "student" || currentRole === "company") && (
              <>
                <div className="w-full flex justify-center mb-4">
                    <GoogleLogin 
                      onSuccess={handleGoogleSuccess} 
                      onError={() => {
                        setError("Google Sign-In failed to connect.");
                        showNotification("Google Sign-In failed to connect.", "error");
                      }}
                      theme="outline" 
                      size="large" 
                      shape="rectangular"
                    />
                </div>

                <div className="flex items-center w-full mb-4">
                  <div className="flex-1 border-t border-gray-200"></div>
                  <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Or standard login</span>
                  <div className="flex-1 border-t border-gray-200"></div>
                </div>
              </>
            )}

            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#346b41]/5 text-[#346b41] text-[10px] font-extrabold uppercase tracking-[0.2em] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#346b41] animate-pulse"></span>
              Secure Portal Access
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-100 text-red-600 px-4 py-2.5 rounded-2xl w-full text-xs font-semibold flex items-center justify-start gap-3 mb-4 mt-2 animate-in fade-in slide-in-from-top-2 text-left">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
          </div>

          <LoginForm
            initialRole={initialRole}
            onRoleChange={setCurrentRole}
            onForgotPassword={() => setShowForgot(true)}
            onSuccess={(role) => {
              onClose();
              const roleRoutes = {
                student: "/student-dashboard",
                company: "/company-dashboard",
                admin: "/admin-dashboard",
              };
              navigate(roleRoutes[role] || "/");
            }}
            onSwitchToRegister={(role) => {
              onClose();
              onSwitchToRegister(role);
            }}
          />

        </div>
      </div>
    </div>
    <ForgotPasswordModal isOpen={showForgot} onClose={() => setShowForgot(false)} role={currentRole} />
    </>
  );
};

export default LoginModal;
