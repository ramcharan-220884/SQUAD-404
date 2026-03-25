import React, { useState, useRef, useEffect } from 'react';

export const getCompanyInitial = (notif) => {
  if (!notif || !notif.message) return "C";
  let companyName = "";
  if (notif.type === 'job' && notif.message.includes('posted a job')) {
    companyName = notif.message.split(' posted a job')[0];
  } else if (notif.type === 'selected' && notif.message.includes('selected for ')) {
    companyName = notif.message.split('selected for ')[1];
  } else if (notif.type === 'shortlisted' && notif.message.includes('shortlisted for ')) {
    companyName = notif.message.split('shortlisted for ')[1];
  }
  
  if (companyName && companyName.trim().length > 0) {
    return companyName.trim().charAt(0).toUpperCase();
  }
  return notif.message.charAt(0).toUpperCase();
};

export default function Header({ notifications = [], onNotificationClick, onViewAll }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });

  const userName = localStorage.getItem("userName") || "Student";
  const initials = userName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "S";

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const latest = notifications.slice(0, 3);

  const handleBellClick = () => {
    console.log("[Notifications] Bell icon clicked. Unread count:", unreadCount);
    setDropdownOpen(prev => !prev);
  };

  const handleNotifClick = (notif) => {
    setDropdownOpen(false);
    if (onNotificationClick) onNotificationClick(notif);
  };

  const handleViewAll = () => {
    setDropdownOpen(false);
    if (onViewAll) onViewAll();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000); // minutes
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

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

        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            className="db-notif-btn"
            title="Notifications"
            onClick={handleBellClick}
            style={{ position: 'relative' }}
          >
            <svg width="17" height="17" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: '-4px', right: '-4px',
                background: '#dc2626', color: '#fff',
                fontSize: '10px', fontWeight: 700,
                borderRadius: '50%', minWidth: '16px', height: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 3px', lineHeight: 1, border: '2px solid #fff'
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              background: '#fff', borderRadius: '16px',
              boxShadow: '0 12px 40px rgba(10,37,64,0.15)',
              border: '1px solid #e8ecf0',
              width: '320px', zIndex: 500,
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #f0f4f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0a2540' }}>Notifications</span>
                {unreadCount > 0 && (
                  <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>
                    {unreadCount} unread
                  </span>
                )}
              </div>

              {/* Notification Items */}
              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {latest.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#8492a6', fontSize: '13px' }}>No notifications yet</div>
                ) : (
                  latest.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      style={{
                        padding: '12px 18px',
                        borderBottom: '1px solid #f5f7fa',
                        cursor: 'pointer',
                        background: notif.is_read ? '#fff' : '#fdf8f8',
                        transition: 'background 0.15s ease',
                        display: 'flex', gap: '10px', alignItems: 'flex-start'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.background = notif.is_read ? '#fff' : '#fdf8f8'}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: notif.type === 'selected' ? 'linear-gradient(135deg,#166534,#15803d)' :
                                    notif.type === 'job' ? 'linear-gradient(135deg,#800000,#4a0000)' :
                                    'linear-gradient(135deg,#1d4ed8,#1e40af)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700 }}>
                          {getCompanyInitial(notif)}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: '13px', fontWeight: notif.is_read ? 400 : 600,
                          color: '#0a2540', margin: 0, lineHeight: 1.4,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {notif.message}
                        </p>
                        <span style={{ fontSize: '11px', color: '#8492a6' }}>{formatTime(notif.created_at)}</span>
                      </div>
                      {!notif.is_read && (
                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#dc2626', flexShrink: 0, marginTop: '5px' }} />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 18px', borderTop: '1px solid #f0f4f8' }}>
                <button
                  onClick={handleViewAll}
                  style={{
                    width: '100%', padding: '9px', borderRadius: '10px',
                    background: 'linear-gradient(90deg, #800000, #4a0000)',
                    color: '#fff', fontSize: '13px', fontWeight: 700,
                    border: 'none', cursor: 'pointer',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="db-avatar" title={userName}>
          <span className="db-avatar-fallback">{initials}</span>
        </div>
      </div>
    </header>
  );
}
