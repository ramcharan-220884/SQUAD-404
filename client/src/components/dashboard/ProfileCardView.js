import React from 'react';
import { API_BASE } from '../../services/api';

const BACKEND_URL = API_BASE.replace('/api', '');

export default function ProfileCardView({ profile, onEdit, onSettings }) {
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.replace(/\\/g, '/');
    return `${BACKEND_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  const Field = ({ label, value, textarea = false }) => (
    <div className="profile-form-field">
      <span className="profile-form-label">{label}</span>
      <div className={`profile-form-value ${textarea ? 'textarea' : ''}`}>
        {value || <span className="text-gray-400 italic font-medium">Not Provided</span>}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <div className="grand-profile-card">
        {/* Header Section with Profile Photo */}
        <div className="profile-form-section flex flex-col md:flex-row items-center gap-8 bg-gray-50/50 dark:bg-slate-900/30 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 mb-8">
          <div className="grand-card-avatar-small relative group overflow-hidden">
            {profile.profile_photo_url ? (
              <img src={getFullUrl(profile.profile_photo_url)} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
              <div className="w-full h-full bg-[#800000]/10 flex items-center justify-center text-3xl font-black text-[#800000] uppercase">
                {profile.name?.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-grow text-center md:text-left">
            <h1 className="text-4xl font-black text-[#800000] dark:text-[#ff9999] mb-1">{profile.name}</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm italic">{profile.degree || "Student"}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <button onClick={onEdit} className="bg-[#800000] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#4a0000] transition-colors shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Edit Profile
              </button>
              <button onClick={onSettings} className="bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* Basic Details Section */}
        <div className="profile-form-section">
          <h3 className="profile-form-section-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Personal Information
          </h3>
          <div className="profile-form-grid">
            <Field label="Full Name" value={profile.name} />
            <Field label="Email Address" value={profile.email} />
            <Field label="Date of Birth" value={formatDate(profile.dob)} />
            <Field label="Gender" value={profile.gender} />
            <Field label="Location" value={profile.location} />
            <Field label="Phone" value={`${profile.country_code || '+91'} ${profile.phone || ''}`} />
          </div>
        </div>

        {/* Summary Section */}
        {profile.summary && (
          <div className="profile-form-section">
            <h3 className="profile-form-section-title">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
              Professional Summary
            </h3>
            <div className="profile-form-value textarea">
              {profile.summary}
            </div>
          </div>
        )}

        {/* Education Section */}
        <div className="profile-form-section">
          <h3 className="profile-form-section-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>
            Academic Overview
          </h3>
          <div className="profile-form-grid">
            <div className="md:col-span-2">
              <Field label="College / University" value={profile.college} />
            </div>
            <Field label="Degree Program" value={profile.degree} />
            <Field label="Specialization" value={profile.specialization} />
            <Field label="Duration" value={profile.edu_start_year && profile.edu_end_year ? `${profile.edu_start_year} - ${profile.edu_end_year}` : null} />
            <Field label="Current CGPA" value={profile.cgpa} />
          </div>
        </div>

        {/* Skills & Projects */}
        <div className="profile-form-section">
          <h3 className="profile-form-section-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            Professional Portfolio
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field 
                label="Technical Skills" 
                value={profile.skills} 
                textarea={true} 
              />
              <Field 
                label="Tools & Technologies" 
                value={profile.tools_technologies} 
                textarea={true} 
              />
            </div>
            
            <div className="mt-4">
              <span className="profile-form-label mb-3 block">Projects</span>
              <div className="grid grid-cols-1 gap-4">
                {(() => {
                  let projects = [];
                  try {
                    projects = typeof profile.projects === 'string' ? JSON.parse(profile.projects) : (profile.projects || []);
                  } catch (e) {
                    return <div className="text-sm italic text-gray-400">Legacy project data: {profile.projects}</div>;
                  }
                  
                  if (!Array.isArray(projects)) return <div className="text-sm italic text-gray-400">{profile.projects || "No projects"}</div>;
                  
                  return projects.map((p, i) => (
                    <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm">
                      <div className="font-bold text-[#800000] dark:text-[#ff9999]">{p.title}</div>
                      <p className="text-xs font-bold text-gray-500 mt-0.5">{p.technologies}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{p.description}</p>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section */}
        <div className="profile-form-section">
          <h3 className="profile-form-section-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Work Experience
          </h3>
          <div className="space-y-4">
            {(() => {
              let exps = [];
              try {
                exps = typeof profile.internships === 'string' ? JSON.parse(profile.internships) : (profile.internships || []);
              } catch (e) {
                return <div className="text-sm italic text-gray-400">No experience records</div>;
              }
              
              if (!Array.isArray(exps) || exps.length === 0) return <div className="text-sm italic text-gray-400">No experience records</div>;
              
              return exps.map((exp, i) => (
                <div key={i} className="p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-sm flex justify-between items-start">
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-lg">{exp.role}</div>
                    <div className="text-[#800000] dark:text-[#ff9999] font-bold text-sm">{exp.company}</div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{exp.description}</p>
                  </div>
                  <div className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">
                    {exp.startDate} - {exp.endDate}
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Certifications & Documents */}
        <div className="profile-form-section">
          <h3 className="profile-form-section-title">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Certifications & Documents
          </h3>
          <div className="space-y-6">
            <Field label="Certifications" value={profile.certifications} textarea={true} />
            <div className="profile-form-grid">
              <div className="profile-form-field">
                <span className="profile-form-label">Resume / CV</span>
                {profile.resume_url ? (
                  <a href={profile.resume_url} target="_blank" rel="noreferrer" className="profile-form-value text-[#800000] hover:bg-[#800000]/5 transition-colors group">
                    <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    View Attached Resume.pdf
                  </a>
                ) : (
                  <div className="profile-form-value text-gray-400 italic">No resume uploaded</div>
                )}
              </div>
              <div className="profile-form-field">
                <span className="profile-form-label">Profile Status</span>
                <div className="profile-form-value text-green-600 dark:text-green-400 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Completed & Verified
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
