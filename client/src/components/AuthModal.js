const AuthModal = ({ isOpen, onClose, role, onLogin, onRegister }) => {
  if (!isOpen) return null;

  const handleAction = (type) => {
    onClose();
    if (type === 'login') {
      if (onLogin) onLogin(role.toLowerCase());
    } else {
      if (onRegister) onRegister(role.toLowerCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-black/40 backdrop-blur-sm transition-opacity overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm my-auto transform transition-all animate-in fade-in zoom-in duration-300 max-h-[95vh] overflow-hidden">
        <div className="p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#346b41]/10 rounded-lg text-[#346b41]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-[#052c42]">
                {role} Portal
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <p className="text-gray-600 mb-4 leading-relaxed text-sm">
            Welcome to the <strong>{role}</strong> portal. Choose to log in or create an account.
          </p>
          
          <div className="space-y-2">
            <button
              onClick={() => handleAction('login')}
              className="w-full py-2.5 px-4 bg-[#346b41] hover:bg-[#264e2f] text-white font-bold rounded-xl shadow-lg shadow-[#346b41]/20 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-sm"
            >
              Login to Your Account
            </button>
            
            {role !== 'Admin' && (
              <button
                onClick={() => handleAction('register')}
                className="w-full py-2.5 px-4 bg-white border-2 border-[#346b41] text-[#346b41] hover:bg-[#346b41]/5 font-bold rounded-xl transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 text-sm"
              >
                Create New Account
              </button>
            )}
           
            {role === 'Admin' && (
              <p className="text-center text-xs text-gray-500 mt-4 italic">
                * Admin accounts can only be created by system administrators.
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-5 py-2.5 flex justify-center border-t border-gray-100">
          <button 
            onClick={onClose}
            className="text-[10px] text-gray-500 hover:text-[#052c42] font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
