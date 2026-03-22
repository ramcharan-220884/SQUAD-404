import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from '../../services/studentService';
import socketService from '../../services/socketService';

const menuItems = [
// ... (rest of the file)
  {
    id: 'home',
    label: 'Home',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75v-4.5h-4.5V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z" />
      </svg>
    ),
  },
  {
    id: 'jobs',
    label: 'Browse Jobs',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.073c0 .621-.504 1.125-1.125 1.125H4.875A1.125 1.125 0 013.75 18.223v-4.073M20.25 14.15A11.227 11.227 0 0012 17.25c-3.18 0-6.085-.666-8.25-1.748M20.25 14.15V9.375c0-.621-.504-1.125-1.125-1.125H4.875c-.621 0-1.125.504-1.125 1.125v4.775M9 9.375v-1.5a3 3 0 116 0v1.5" />
      </svg>
    ),
  },
  {
    id: 'applied-jobs',
    label: 'Applied Jobs',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    id: 'profile',
    label: 'My Profile',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    ),
  },
  {
    id: 'events',
    label: 'Events',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    id: 'competitions',
    label: 'Competitions',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99-2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
      </svg>
    ),
  },
  {
    id: 'assessments',
    label: 'Assessments',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a13.247 13.247 0 01-1.022-2.384m2.676-1.849c.473-.049.943-.08 1.413-.082m0 0a1.5 1.5 0 011.433 1.062m-1.433-1.062V9.106m0 0a1.5 1.5 0 011.433-1.062m-1.433 1.062v5.332m0-5.332c.47-.002.94-.033 1.413-.082m1.413 5.332a.75.75 0 00.75-.75V11.25a.75.75 0 00-.75-.75m-1.413 5.332c1.097-.114 2.181-.223 3.25-.327a1.5 1.5 0 001.357-1.492V9.106a1.5 1.5 0 00-1.357-1.492c-1.069-.104-2.153-.213-3.25-.327m0 5.332V9.106M15 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: (
      <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
];

export default function Sidebar({ activeItem, onItemClick }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [settings, setSettings] = useState({ academic_year: '...', semester: '...' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getSettings();
        if (data) setSettings(data);
      } catch (err) {
        console.error("Error fetching sidebar settings:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    sessionStorage.clear();
    socketService.disconnect();
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleNavClick = (id) => {
    if (id === 'profile') {
      navigate('/student-profile');
    } else {
      if (onItemClick) {
        onItemClick(id);
      } else {
        navigate('/student-dashboard');
      }
    }
  };

  return (
    <>
      <aside className="db-sidebar" style={{ background: 'linear-gradient(180deg, #2b0000, #800000)' }}>
        {/* Logo */}
        <div className="db-sidebar-logo">
          <div className="db-sidebar-logo-icon" style={{ background: 'linear-gradient(135deg, #a00000, #800000)' }}>
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
            </svg>
          </div>
        <div className="db-sidebar-logo-text">
          <h1>RGUKT</h1>
          <span>Student Portal</span>
        </div>
      </div>

      {/* Main Nav */}
      <nav className="db-sidebar-nav">
        <div className="db-sidebar-section-label">Main Menu</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`db-nav-item${activeItem === item.id ? ' active' : ''}`}
            onClick={() => handleNavClick(item.id)}
            style={activeItem === item.id ? { 
              background: 'linear-gradient(90deg, rgba(160,0,0,0.25) 0%, rgba(160,0,0,0.08) 100%)',
              borderLeft: '3px solid #ff4d4d',
              color: '#fff'
            } : {}}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Support & Logout */}
      <div className="db-sidebar-support">
        <div className="db-sidebar-section-label">Support</div>
        <button 
          className={`db-nav-item${activeItem === 'help' ? ' active' : ''}`}
          onClick={() => handleNavClick('help')}
          style={activeItem === 'help' ? { 
            background: 'linear-gradient(90deg, rgba(160,0,0,0.25) 0%, rgba(160,0,0,0.08) 100%)',
            borderLeft: '3px solid #ff4d4d',
            color: '#fff'
          } : {}}
        >
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
          Help &amp; Support
        </button>

        {/* Logout Button */}
        <button 
          className="db-nav-item logout-btn"
          onClick={handleLogoutClick}
          style={{ marginTop: '4px' }}
        >
          <svg className="nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          Logout
        </button>
      </div>

      {/* Academic Year Card */}
      <div className="db-academic-card" style={{ background: 'linear-gradient(135deg, rgba(128,0,0,0.2) 0%, rgba(128,0,0,0.3) 100%)', border: '1px solid rgba(128,0,0,0.25)' }}>
        <div className="db-academic-card-label">Academic Year</div>
        <div className="db-academic-card-year">{settings.academic_year || '2024 – 2025'}</div>
        <div className="db-academic-card-sub">{settings.semester || 'Semester II'} · Active</div>
      </div>
    </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="db-logout-modal-overlay">
          <div className="db-logout-modal">
            <div className="db-logout-modal-icon">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3>Log Out</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="db-logout-modal-actions">
              <button className="db-btn-cancel" onClick={cancelLogout}>No</button>
              <button className="db-btn-confirm" onClick={confirmLogout}>Yes</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
