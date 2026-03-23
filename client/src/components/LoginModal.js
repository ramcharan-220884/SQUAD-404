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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-black/60 backdrop-blur-md transition-all duration-300 overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all animate-in fade-in zoom-in duration-300 relative border border-white/20 flex flex-col h-auto my-auto max-h-[95vh] overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-50 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-all"
          aria-label="Close modal"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Branding Header */}
        <div className="bg-gradient-to-tr from-[#800000] to-[#4a0000] p-4 text-center text-white relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
          <h1 className="text-2xl font-black tracking-tight relative z-10">EDUVATE</h1>
          <p className="opacity-80 font-bold mt-0.5 uppercase tracking-[0.2em] text-[8px] relative z-10">Secure Portal Access</p>
        </div>

        {/* Form Container */}
        <div className="p-5">
          <h2 className="text-lg font-black text-[#052c42] mb-2 text-center">Login to Portal</h2>
          
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

          {error && (
            <div className="bg-red-50 border-2 border-red-100 text-red-600 px-4 py-2.5 rounded-2xl w-full text-xs font-semibold flex items-center justify-start gap-3 mb-4 mt-2 animate-in fade-in slide-in-from-top-2 text-left">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          
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
