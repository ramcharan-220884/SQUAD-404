import React from "react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-gray-950 text-gray-300 pt-16 pb-8 border-t border-gray-900">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-10">
      {/* Brand */}
      <div className="md:col-span-1">
        <h2 className="text-2xl font-extrabold text-white mb-4">
          Campus<span className="text-indigo-400">Connect</span>
        </h2>
        <p className="text-sm leading-relaxed text-gray-400 mb-6">
          Bridging the gap between talented students and top-tier companies.
          The ultimate all-in-one campus placement governance portal.
        </p>
        {/* Social icons */}
        <div className="flex gap-4">
          {[
            { icon: "🐦", label: "Twitter" },
            { icon: "💼", label: "LinkedIn" },
            { icon: "📸", label: "Instagram" },
            { icon: "🐙", label: "GitHub" },
          ].map((social, i) => (
            <span
              key={i}
              title={social.label}
              className="w-9 h-9 rounded-full bg-gray-900/50 border border-gray-800 flex items-center justify-center text-base cursor-pointer hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-300"
            >
              {social.icon}
            </span>
          ))}
        </div>
      </div>

      {/* Platform Links */}
      <div>
        <h3 className="text-lg font-bold text-white mb-5">Platform</h3>
        <ul className="space-y-3 text-sm">
          {[
            { label: "Home", to: "/home" },
            { label: "About Us", to: "/home" },
            { label: "Features", to: "/home" },
            { label: "Recruiters", to: "/login" },
            { label: "Admin Portal", to: "/login" },
          ].map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-indigo-400 transition-colors" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Student Links */}
      <div>
        <h3 className="text-lg font-bold text-white mb-5">Students</h3>
        <ul className="space-y-3 text-sm">
          {[
            { label: "Job Board", to: "/login" },
            { label: "Application Tracker", to: "/login" },
            { label: "Resume Builder", to: "/login" },
            { label: "Student Login", to: "/login" },
            { label: "Register New Student", to: "/register" },
          ].map(({ label, to }) => (
            <li key={label}>
              <Link
                to={to}
                className="hover:text-indigo-400 transition-colors duration-200 flex items-center gap-2 group"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-800 group-hover:bg-indigo-400 transition-colors" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Info */}
      <div>
        <h3 className="text-lg font-bold text-white mb-5">Contact Us</h3>
        <ul className="space-y-4 text-sm text-gray-400">
          <li className="flex items-start gap-3">
            <span className="text-indigo-400 mt-1">📍</span>
            <span>
              Placement Cell, Level 4, Academic Block A<br />
              Main University Campus, New Delhi 110001
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-indigo-400">📧</span>
            <a href="mailto:support@campusconnect.edu" className="hover:text-white transition-colors">
              support@campusconnect.edu
            </a>
          </li>
          <li className="flex items-center gap-3">
            <span className="text-indigo-400">📞</span>
            <span>+91-800-226-7871</span>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-gray-900 pt-8 mt-10 text-center text-xs text-gray-500 max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p>© {new Date().getFullYear()} CampusConnect Governance. All rights reserved.</p>
      <div className="flex gap-6">
        <Link to="/home" className="hover:text-white transition-colors">Privacy Policy</Link>
        <Link to="/home" className="hover:text-white transition-colors">Terms of Service</Link>
        <Link to="/home" className="hover:text-white transition-colors">Cookie Policy</Link>
      </div>
    </div>
  </footer>
);

export default Footer;
