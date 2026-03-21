import React from 'react';
import ThemeToggle from './ThemeToggle';

export default function Header() {
  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });

  // Read the logged-in user's name from localStorage (set during login)
  const userName = localStorage.getItem("userName") || "Student";
  const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "S";

  return (
    <header className="db-header">
      <div className="db-header-left">
        <h2>Welcome back, {userName} 👋</h2>
        <p>{currentDate} · RGUKT Portal</p>
      </div>

      <div className="db-header-right">
        {/* Search Bar */}
        <div className="db-search-bar">
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803a7.5 7.5 0 0010.607 0z" />
          </svg>
          <input type="text" placeholder="Search anything..." />
        </div>

        {/* Notification */}
        <button className="db-notif-btn" title="Notifications">
          <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
          <span className="db-notif-badge" />
        </button>

        {/* Theme Toggle */}
        <ThemeToggle role="student" />

        {/* Avatar — initials only (no hardcoded image) */}
        <div className="db-avatar" title={userName}>
          <span className="db-avatar-fallback">{initials}</span>
        </div>
      </div>
    </header>
  );
}
