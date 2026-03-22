import React, { useEffect, useRef, useState } from "react";


const AdminSection = ({ onLoginClick }) => {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      title: "Full Oversight",
      description: "Manage students, companies, and placement drives from a centralized administrative control panel.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      title: "Report Generation",
      description: "Generate detailed placement statistics and analytics reports with just a few clicks for institutional records.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: "Company Management",
      description: "Approve and manage recruiter registrations and coordinate campus recruitment drives efficiently.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="admin"
      ref={sectionRef}
      className="py-24 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Illustration */}
          <div
            className={`transition-all duration-1000 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <div className="relative">
              {/* Decorative blobs */}
              <div className="absolute top-0 -left-6 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
              <div className="absolute -bottom-8 right-0 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
              
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-gray-100">
                <img
                  src="/admin_features.png"
                  alt="Admin Command Center"
                  className="rounded-2xl w-full h-auto shadow-sm"
                />
                
                {/* Floating status card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 max-w-[200px] hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">System Secure</p>
                      <p className="text-xs text-gray-500">Live Monitoring</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Content */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold tracking-widest uppercase">
              Admin Governance
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              Manage{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Everything
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-10">
              A powerful, all-in-one command center for placement officers. Oversee the entire recruitment lifecycle, ensure data integrity, and generate actionable insights effortlessly.
            </p>

            <div className="space-y-8">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-4 transition-all duration-700 hover:translate-x-2 group`}
                  style={{ 
                    transitionDelay: `${idx * 200 + 400}ms`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shadow-sm border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-12 transition-all duration-700 delay-[1000ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                onClick={onLoginClick}
                className="px-8 py-4 rounded-full bg-emerald-600 text-white font-bold text-lg shadow-lg hover:bg-emerald-700 hover:scale-105 active:scale-95 hover:shadow-emerald-200 transition-all duration-300"
              >
                Admin Login
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AdminSection;
