import React from 'react';

const JobProgressBar = ({ steps, currentStep, isRejected }) => {
  return (
    <div className="job-progress-container">
      <div className="job-progress-steps">
        {steps.map((step, index) => {
          const isActive = index <= currentStep;
          const isCurrent = index === currentStep;
          
          let stepClass = "job-progress-step";
          if (isActive) stepClass += " active";
          if (isCurrent) stepClass += " current";
          if (isRejected && index === steps.length - 1) stepClass += " rejected";

          return (
            <div key={index} className={stepClass}>
              <div className="step-point">
                {isActive && !isRejected && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                )}
                {isRejected && index === steps.length - 1 && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                )}
              </div>
              <span className="step-label">{step}</span>
            </div>
          );
        })}
      </div>
      <div className="job-progress-line-container">
        <div 
          className="job-progress-line" 
          style={{ 
            width: `${(currentStep / (steps.length - 1)) * 100}%`,
            backgroundColor: isRejected && currentStep === steps.length - 1 ? '#ef4444' : '#1a73e8'
          }}
        ></div>
        <div className="job-progress-line-bg"></div>
      </div>
    </div>
  );
};

export default JobProgressBar;
