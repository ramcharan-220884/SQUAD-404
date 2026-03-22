import React, { useState } from 'react';
import { authFetch } from '../../services/api';

export default function AccountSettingsView({ profile, onBack, onUpdate, isDark, onToggleTheme }) {
  const [email, setEmail] = useState(profile.email || '');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(profile.dark_mode === 1 || profile.dark_mode === true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleToggleDarkMode = async () => {
    const newVal = !darkMode;
    setDarkMode(newVal);
    // Apply immediate UI change via parent
    if (onToggleTheme) {
      onToggleTheme();
    }
    
    // Persist to backend
    try {
      await authFetch(`/students/profile`, {
        method: 'PUT',
        body: JSON.stringify({ dark_mode: newVal })
      });
    } catch (e) {
      console.error("Failed to save dark mode preference", e);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage('');
    try {
      const payload = { email };
      if (password) payload.password = password;
      
      const res = await authFetch(`/students/profile`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Settings updated successfully!');
        if (onUpdate) onUpdate();
        setPassword('');
      } else {
        setMessage(data.message || 'Error updating settings');
      }
    } catch (err) {
      setMessage('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h2 className="text-2xl font-bold text-[#800000] dark:text-gray-100">Account Settings</h2>
      </div>

      <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 rounded-2xl p-8 space-y-8">
        
        {/* Dark Mode Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-xl">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">Dark Mode</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
          </div>
          <button 
            onClick={handleToggleDarkMode}
            className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${darkMode ? 'bg-[#800000]' : 'bg-gray-300'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">New Password (leave blank to keep current)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900 dark:text-white"
            />
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm font-bold ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end gap-3 items-center">
            <button 
              type="button" 
              onClick={onBack}
              className="px-6 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-[#800000] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#4a0000] transition-all shadow-lg disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
