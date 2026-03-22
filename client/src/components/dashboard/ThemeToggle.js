import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ isDarkMode, onToggle, role }) {
  const themeCtx = useTheme();
  const currentDark = isDarkMode !== undefined ? isDarkMode : themeCtx?.darkMode;
  const currentToggle = onToggle || themeCtx?.toggleTheme;

  return (
    <button 
      onClick={currentToggle} 
      className={`p-2 rounded-xl transition-all duration-300 flex items-center gap-2 group ${
        currentDark 
          ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700 shadow-lg shadow-yellow-400/10' 
          : 'bg-gray-100 text-slate-600 hover:bg-gray-200 shadow-sm'
      }`}
      title={currentDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {currentDark ? (
        <>
          <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-bold md:hidden lg:inline">Light</span>
        </>
      ) : (
        <>
          <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
          <span className="text-xs font-bold md:hidden lg:inline">Dark</span>
        </>
      )}
    </button>
  );
}
