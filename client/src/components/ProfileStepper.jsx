import React from 'react';

const ProfileStepper = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4 mb-8">
      <div className="flex items-center justify-between relative px-2">
        {/* Progress Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#800000] transition-all duration-500 ease-in-out"
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* steps */}
        {steps.map((label, index) => (
          <div key={index} className="relative z-10 flex flex-col items-center group">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 border-2 ${
                index <= currentStep 
                  ? 'bg-[#800000] border-[#800000] text-white scale-110 shadow-lg' 
                  : 'bg-white border-gray-300 text-gray-400 group-hover:border-gray-400'
              }`}
            >
              {index < currentStep ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <span 
              className={`absolute top-12 text-[10px] md:text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                index <= currentStep ? 'text-[#800000] opacity-100' : 'text-gray-400 opacity-60'
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileStepper;
