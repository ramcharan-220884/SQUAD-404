import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />
};

const themes = {
  student: {
    bg: 'bg-white',
    accent: 'border-[#800000]',
    iconColor: 'text-[#800000]',
    shadow: 'shadow-[#800000]/10'
  },
  company: {
    bg: 'bg-white',
    accent: 'border-[#166534]',
    iconColor: 'text-[#166534]',
    shadow: 'shadow-[#166534]/10'
  },
  admin: {
    bg: 'bg-[#064e3b]',
    accent: 'border-emerald-400',
    iconColor: 'text-emerald-400',
    shadow: 'shadow-emerald-900/20',
    textColor: 'text-white'
  }
};

const NotificationCard = ({ message, type, theme, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);
  const themeStyles = themes[theme] || themes.student;
  
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300); // Match animation duration
  };

  return (
    <div 
      className={`
        pointer-events-auto
        flex items-start gap-4 p-4 rounded-2xl border-l-4 shadow-2xl transition-all duration-300 transform
        ${themeStyles.bg} ${themeStyles.accent} ${themeStyles.shadow}
        ${isExiting ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}
        animate-in slide-in-from-top duration-300
      `}
    >
      <div className={`${themeStyles.iconColor} mt-1`}>
        {icons[type] || icons.info}
      </div>
      
      <div className="flex-1">
        <p className={`text-sm font-bold leading-relaxed ${themeStyles.textColor || 'text-gray-900'}`}>
          {message}
        </p>
      </div>

      <button 
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationCard;
