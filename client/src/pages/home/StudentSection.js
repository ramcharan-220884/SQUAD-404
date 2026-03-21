import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const StudentSection = ({ onLoginClick }) => {
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
      title: "Smart Job Matching",
      description: "Our AI-powered engine matches your skills and preferences with the best job openings and internships.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Application Tracker",
      description: "Keep track of all your applications in an easy-to-use pipeline. Never miss a deadline or interview.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      title: "Resume Builder",
      description: "Create professional, ATS-friendly resumes in minutes with our built-in builder and templates.",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
    },
  ];

  return (
    <section
      id="students"
      ref={sectionRef}
      className="py-24 bg-gray-50 overflow-hidden"
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
              {/* Decorative blob */}
              <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob" />
              <div className="absolute -bottom-8 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000" />
              
              <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-gray-100">
                <img
                  src="/student_features.png"
                  alt="Student Dashboard"
                  className="rounded-2xl w-full h-auto shadow-sm"
                />
                
                {/* Floating info card */}
                <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 max-w-[200px] hidden sm:block">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Application Sent</p>
                      <p className="text-xs text-gray-500">Google Inc.</p>
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
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold tracking-widest uppercase">
              Student Empowerement
            </span>
            <h2 className="text-4xl font-extrabold text-gray-900 leading-tight mb-6">
              Launch Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
                Career
              </span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-10">
              Your career journey starts here. We provides all the tools you need to stand out from the crowd and land your dream role in top companies.
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
                  <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-12 flex flex-wrap gap-4 transition-all duration-700 delay-[1000ms] ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <button
                onClick={onLoginClick}
                className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg hover:bg-indigo-700 hover:scale-105 active:scale-95 hover:shadow-indigo-200 transition-all duration-300"
              >
                Student Login
              </button>
              <button
                onClick={() => {
                  // This is a bit of a hack since we don't have onRegisterClick here, 
                  // but we can trigger it via the login click if we handle it correctly in Home.js
                  // or better, we pass onRegisterClick down.
                  if (window.onStudentRegister) window.onStudentRegister();
                }}
                className="px-8 py-4 rounded-full bg-white border-2 border-indigo-600 text-indigo-600 font-bold text-lg shadow-lg hover:bg-indigo-50 hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Sign Up as Student
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default StudentSection;
