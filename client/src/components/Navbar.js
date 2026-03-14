import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = ({ onLoginClick }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/home"
          className={`text-3xl font-extrabold tracking-tight transition-colors duration-300 ${
            scrolled ? "text-indigo-700" : "text-white"
          }`}
        >
          EDU<span className="text-blue-400">VATE</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { label: "Home", id: "hero" },
            { label: "Students", id: "students" },
            { label: "Companies", id: "companies" },
            { label: "Admin", id: "admin" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={`text-sm font-semibold transition-colors duration-200 hover:text-indigo-400 focus:outline-none ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {label}
            </button>
          ))}

          <button
            onClick={onLoginClick}
            className="ml-2 px-5 py-2 rounded-full bg-indigo-600 text-white text-sm font-bold shadow hover:bg-indigo-700 active:scale-95 transition-all duration-200"
          >
            Login
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`block h-0.5 w-6 transition-all duration-300 ${
                scrolled ? "bg-gray-800" : "bg-white"
              } ${
                menuOpen && i === 0
                  ? "rotate-45 translate-y-2"
                  : menuOpen && i === 1
                  ? "opacity-0"
                  : menuOpen && i === 2
                  ? "-rotate-45 -translate-y-2"
                  : ""
              }`}
            />
          ))}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-white shadow-xl overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-96 py-4" : "max-h-0"
        }`}
      >
        <div className="flex flex-col items-center gap-4 px-6">
          {[
            { label: "Home", id: "hero" },
            { label: "Students", id: "students" },
            { label: "Companies", id: "companies" },
            { label: "Admin", id: "admin" },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className="text-gray-700 font-semibold hover:text-indigo-600 transition-colors w-full text-center py-2 border-b border-gray-100"
            >
              {label}
            </button>
          ))}
          <button
            onClick={() => { onLoginClick(); setMenuOpen(false); }}
            className="w-full py-2.5 rounded-full bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
