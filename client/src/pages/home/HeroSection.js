import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = ({ onGetStarted }) => {
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const images = [
    {
      src: "/hero_placement.png",
      alt: "Global Opportunities",
      detail: "Top Placement Drive",
    },
    {
      src: "/hero_students.png",
      alt: "Talent Showcase",
      detail: "Success Stories",
    },
    {
      src: "/hero_company.png",
      alt: "Top Recruiters",
      detail: "Fortune 500 Partners",
    },
  ];

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <section
      id="hero"
      className="relative min-h-[95vh] flex items-center overflow-hidden bg-[#0A0F1E]"
    >
      {/* Dynamic Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[30%] h-[30%] bg-indigo-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[10%] right-[5%] w-[30%] h-[30%] bg-blue-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
        
        {/* Left Side: Content */}
        <div
          className={`text-center lg:text-left transition-all duration-1000 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-300 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-ping"></span>
            <span className="text-sm font-bold tracking-widest uppercase">Placement Year 2026</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6">
            Where Talent <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400">
              Meets Opportunity
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-gray-400 leading-relaxed mb-10 max-w-xl mx-auto lg:mx-0">
            The ecosystem for elite campus placements. Connect with global leaders, 
            streamline your career path, and reach your true potential.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button 
              onClick={onGetStarted}
              className="px-8 py-4 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Get Started
            </button>
          </div>

          {/* Minimal Stats */}
          <div className="mt-16 flex items-center justify-center lg:justify-start gap-12 text-sm">
            <div>
              <p className="text-2xl font-bold text-white">5,000+</p>
              <p className="text-gray-500 font-medium">Placed</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">200+</p>
              <p className="text-gray-500 font-medium">Companies</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-white">45.5L</p>
              <p className="text-gray-500 font-medium">Max LPA</p>
            </div>
          </div>
        </div>

        {/* Right Side: Dynamic Image Deck */}
        <div className="relative flex items-center justify-center lg:justify-end h-[450px] sm:h-[550px]">
          <div className="relative w-full max-w-[400px]">
            {images.map((img, idx) => {
              // Calculate relative positions for the stack
              const pos = (idx - activeIndex + images.length) % images.length;
              
              const styles = [
                // Front card
                { z: "z-30", scale: "scale-100", rotate: "rotate-2", offset: "translate-x-0 translate-y-0", opacity: "opacity-100", blur: "none" },
                // Back card 1
                { z: "z-20", scale: "scale-90", rotate: "-rotate-6", offset: "translate-x-12 translate-y-12", opacity: "opacity-60", blur: "blur-[2px]" },
                // Back card 2
                { z: "z-10", scale: "scale-80", rotate: "rotate-12", offset: "-translate-x-12 -translate-y-8", opacity: "opacity-40", blur: "blur-[4px]" },
              ];

              const currentStyle = styles[pos];

              return (
                <div
                  key={idx}
                  className={`absolute top-0 left-0 w-full aspect-[4/3] rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-1000 ease-in-out ${currentStyle.z} ${currentStyle.scale} ${currentStyle.rotate} ${currentStyle.offset} ${currentStyle.opacity} ${currentStyle.blur}`}
                >
                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                  
                  {/* Glass Label */}
                  {pos === 0 && (
                    <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 animate-fade-in">
                      <p className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-1">{img.detail}</p>
                      <p className="text-white font-bold text-lg">{img.alt}</p>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Hint Navigation */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
              {images.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 transition-all duration-500 rounded-full ${activeIndex === i ? "w-8 bg-indigo-500" : "w-1.5 bg-white/20"}`}
                />
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Floating Offer Badge (Extra polished) */}
      <div className="absolute top-1/4 right-10 hidden xl:block animate-float">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-xl">
            🔥
          </div>
          <div>
            <p className="text-white font-black leading-none">High Demand</p>
            <p className="text-gray-400 text-xs mt-1">SDE-1 roles peaking</p>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
