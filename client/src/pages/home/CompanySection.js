import React, { useEffect, useRef, useState } from "react";


const CompanySection = ({ onLoginClick }) => {
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
      title: "Candidate Filtering",
      description: "Advanced search and filter options to find the perfect candidates for your specific roles and requirements.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
    },
    {
      title: "Drive Scheduling",
      description: "Organize and schedule placement drives with ease. Automate invitations and interview slots seamlessly.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "Analytics Dashboard",
      description: "Data-driven insights to track your hiring performance and placement statistics in real-time.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="companies"
      ref={sectionRef}
      className="py-24 bg-gray-900 text-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Side: Content */}
          <div
            className={`transition-all duration-1000 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            }`}
          >
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-violet-900 border border-violet-700 text-violet-300 text-xs font-bold tracking-widest uppercase">
              Recruiter Solutions
            </span>
            <h2 className="text-4xl font-extrabold leading-tight mb-6">
              Find Top{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">
                Talent
              </span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed mb-10">
              Streamline your campus recruitment process. Access a vast pool of verified students, organize drives, and hire the best talent with our comprehensive toolkit.
            </p>

            <div className="space-y-8">
              {features.map((feature, idx) => (
                <div 
                  key={idx} 
                  className={`flex gap-4 transition-all duration-700 hover:-translate-x-2 group`}
                  style={{ 
                    transitionDelay: `${idx * 200 + 400}ms`,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(20px)'
                  }}
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-800 text-violet-400 rounded-xl flex items-center justify-center shadow-lg border border-gray-700 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-12 flex flex-wrap gap-4 transition-all duration-700 delay-[1000ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                onClick={onLoginClick}
                className="px-8 py-4 rounded-full bg-violet-600 text-white font-bold text-lg shadow-lg hover:bg-violet-700 hover:scale-105 active:scale-95 hover:shadow-violet-900/40 transition-all duration-300"
              >
                Company Login
              </button>
              <button
                onClick={() => {
                  if (window.onCompanyRegister) window.onCompanyRegister();
                }}
                className="px-8 py-4 rounded-full bg-transparent border-2 border-violet-400 text-violet-400 font-bold text-lg shadow-lg hover:bg-violet-900/30 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Register Company
              </button>
            </div>
          </div>

          {/* Right Side: Illustration */}
          <div
            className={`transition-all duration-1000 delay-300 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            }`}
          >
            <div className="relative">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse" />
              <div className="absolute -bottom-8 left-0 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-pulse animation-delay-2000" />
              
              <div className="relative bg-gray-800 p-4 rounded-3xl shadow-2xl border border-gray-700">
                <img
                  src="/company_features.png"
                  alt="Company Dashboard"
                  className="rounded-2xl w-full h-auto shadow-sm"
                />
                
                {/* Floating metric card */}
                <div className="absolute -top-6 -right-6 bg-gray-800 rounded-2xl p-4 shadow-2xl border border-gray-700 max-w-[200px] hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-900/50 rounded-full flex items-center justify-center text-violet-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">450+ Applicants</p>
                      <p className="text-xs text-gray-500">For Software Engineer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CompanySection;
