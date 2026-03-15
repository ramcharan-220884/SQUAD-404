import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const stakeholders = [
  {
    id: "students",
    emoji: "🎓",
    role: "For Students",
    color: "from-red-800 to-red-900",
    lightBg: "bg-red-50",
    border: "border-red-200",
    accentText: "text-red-800",
    accentBtn: "bg-red-800 hover:bg-red-900",
    title: "Launch Your Career with Confidence",
    description:
      "Browse curated job and internship listings from top companies, track every application in one place, and get notified the moment a recruiter shows interest. Your dream offer is closer than you think.",
    features: [
      "Smart job & internship matching",
      "One-click application tracking",
      "Resume builder & profile showcase",
      "Real-time offer notifications",
    ],
    cta: "Register as Student",
    route: "/register",
  },
  {
    id: "companies",
    emoji: "🏢",
    role: "For Recruiters",
    color: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    border: "border-blue-200",
    accentText: "text-blue-600",
    accentBtn: "bg-blue-600 hover:bg-blue-700",
    title: "Find the Right Talent, Faster",
    description:
      "Post job drives, filter candidates by skills and GPA, schedule interviews, and issue offer letters — all from a single recruiter dashboard. Hire smarter, not harder.",
    features: [
      "Targeted candidate filtering",
      "Bulk interview scheduling",
      "Campus drive management",
      "Analytics & placement reports",
    ],
    cta: "Post a Job Drive",
    route: "/login",
  },
  {
    id: "admin",
    emoji: "🛡️",
    role: "For Administrators",
    color: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50",
    border: "border-emerald-200",
    accentText: "text-emerald-600",
    accentBtn: "bg-emerald-600 hover:bg-emerald-700",
    title: "Total Control Over Placements",
    description:
      "Manage students, companies, and placement drives from a powerful admin console. Approve registrations, track placement statistics, generate reports, and keep the entire process transparent.",
    features: [
      "Student & company management",
      "Placement drive oversight",
      "Detailed statistical reports",
      "Role-based access control",
    ],
    cta: "Admin Login",
    route: "/login",
  },
];

const StakeholderCard = ({ stakeholder, index, onRegisterClick, onCompanyLoginClick, onAdminLoginClick, isFocused, onFocus, pos, isDesktop }) => {
  const navigate = useNavigate();

  const isCenter = pos === "center";
  const isRight = pos === "right";
  const isLeft = pos === "left";

  const zIndex = isCenter ? 3 : 1;
  const opacity = isCenter ? 1 : 0.6;
  const filter = isCenter ? "blur(0px)" : "blur(3px)";
  
  let translateX = "0px";
  if (isDesktop) {
    if (isLeft) translateX = "-360px";
    if (isRight) translateX = "360px";
  }

  const transform = isDesktop 
    ? `translateX(${translateX}) scale(${isCenter ? 1.05 : 0.9})`
    : `scale(${isCenter ? 1.05 : 0.9})`;

  return (
    <div
      onMouseEnter={onFocus}
      onClick={onFocus}
      className={`group rounded-3xl border ${stakeholder.border} ${stakeholder.lightBg} px-6 py-[40px] flex flex-col justify-between h-[450px] ${isCenter ? "shadow-md shadow-indigo-200 cursor-default" : "cursor-pointer"} ${isDesktop ? "absolute top-0 w-[350px]" : "relative w-full mb-8"}`}
      style={{ 
        zIndex, 
        opacity, 
        filter, 
        transform,
        transition: "transform 0.5s ease, opacity 0.5s ease, filter 0.5s ease"
      }}
    >
      {/* Top Badge */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stakeholder.color} flex items-center justify-center text-xl shadow-md`}>
          {stakeholder.emoji}
        </div>
        <span className={`text-xs font-bold tracking-widest uppercase ${stakeholder.accentText}`}>
          {stakeholder.role}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-extrabold text-gray-900 mb-2 leading-tight truncate">
        {stakeholder.title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3">
        {stakeholder.description}
      </p>

      {/* Feature list */}
      <ul className="space-y-1 mb-4 flex-1 overflow-hidden">
        {stakeholder.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <span className={`w-5 h-5 rounded-full bg-gradient-to-br ${stakeholder.color} flex items-center justify-center text-white text-xs flex-shrink-0`}>
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (stakeholder.id === "students" && onRegisterClick) {
            onRegisterClick();
          } else if (stakeholder.id === "companies" && onCompanyLoginClick) {
            onCompanyLoginClick();
          } else if (stakeholder.id === "admin" && onAdminLoginClick) {
            onAdminLoginClick();
          } else {
            navigate(stakeholder.route);
          }
        }}
        className={`w-full py-2 rounded-xl ${stakeholder.accentBtn} text-white font-bold text-sm transition-all duration-200 active:scale-95 shadow-md`}
      >
        {stakeholder.cta} →
      </button>
    </div>
  );
};

const StakeholderSection = ({ onRegisterClick, onCompanyLoginClick, onAdminLoginClick }) => {
  const headingRef = useRef(null);
  const [headingVisible, setHeadingVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  const positions = [
    ["center", "right", "left"],
    ["left", "center", "right"],
    ["right", "left", "center"]
  ];

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setHeadingVisible(true); },
      { threshold: 0.2 }
    );
    if (headingRef.current) observer.observe(headingRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="stakeholders"
      className="relative bg-white py-24 px-6 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #e0e7ff 1px, transparent 0)",
          backgroundSize: "40px 40px",
          opacity: 0.5,
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        {/* Section heading */}
        <div
          ref={headingRef}
          className={`text-center mb-16 transition-all duration-700 ${
            headingVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-bold tracking-widest uppercase">
            Who It's For
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            Built For Every{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">
              Stakeholder
            </span>
          </h2>
          <p className="max-w-2xl mx-auto text-gray-500 text-lg leading-relaxed">
            Whether you're a student searching for your first job, a company
            looking for top talent, or an administrator keeping everything
            running smoothly — EDUVATE has been designed with{" "}
            <strong className="text-gray-700">you</strong> in mind.
          </p>
        </div>

        {/* Cards grid */}
        <div className={`relative flex justify-center w-full max-w-5xl mx-auto ${isDesktop ? "h-[500px]" : "flex-col items-center"}`}>
          {stakeholders.map((s, i) => (
            <StakeholderCard 
              key={s.id}
              stakeholder={s} 
              index={i} 
              isFocused={positions[step][i] === "center"}
              onFocus={() => {
                // Determine the step that brings this card to the center
                const newStep = positions.findIndex(posArray => posArray[i] === "center");
                if (newStep !== -1) setStep(newStep);
              }}
              pos={positions[step][i]}
              isDesktop={isDesktop}
              onRegisterClick={onRegisterClick} 
              onCompanyLoginClick={onCompanyLoginClick} 
              onAdminLoginClick={onAdminLoginClick} 
            />
          ))}
        </div>

        {/* Bottom stat strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { value: "5,000+", label: "Students Placed" },
            { value: "200+",   label: "Partner Companies" },
            { value: "98%",    label: "Satisfaction Rate" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 py-6 px-4 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <p className="text-3xl font-extrabold text-indigo-700">{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StakeholderSection;
