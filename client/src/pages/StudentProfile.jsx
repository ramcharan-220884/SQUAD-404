import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import ProfileStepper from '../components/ProfileStepper';
import ExperienceForm from '../components/ExperienceForm';
import UploadSection from '../components/UploadSection';

const StudentProfile = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    college: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
    notARobot: false,
    educationCollege: '',
    degree: '',
    cgpa: '',
    experiences: [],
    profilePhoto: null,
    resume: null
  });
  const [errors, setErrors] = useState({});
  const [showExpForm, setShowExpForm] = useState(false);

  const steps = [
    "Let's get you started",
    "Current / Most Recent Education",
    "Internships and Work Experience",
    "Profile Photo & Documents",
    "All Done"
  ];

  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 0) {
      if (!formData.firstName) newErrors.firstName = 'This field is required';
      if (!formData.lastName) newErrors.lastName = 'This field is required';
      if (!formData.dob) newErrors.dob = 'This field is required';
      if (!formData.gender) newErrors.gender = 'This field is required';
      if (!formData.college) newErrors.college = 'This field is required';
      if (!formData.password) newErrors.password = 'This field is required';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords must match';
      if (!formData.termsAccepted) newErrors.termsAccepted = 'You must accept the terms';
      if (!formData.notARobot) newErrors.notARobot = 'Please verify you are not a robot';
    } else if (currentStep === 1) {
      if (!formData.educationCollege) newErrors.educationCollege = 'This field is required';
      if (!formData.degree) newErrors.degree = 'This field is required';
      if (!formData.cgpa) newErrors.cgpa = 'This field is required';
    } else if (currentStep === 3) {
      if (!formData.profilePhoto) newErrors.profilePhoto = 'Profile photo is required';
      if (!formData.resume) newErrors.resume = 'Resume is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
    window.scrollTo(0, 0);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddExperience = (exp) => {
    setFormData(prev => ({
      ...prev,
      experiences: [...prev.experiences, exp]
    }));
    setShowExpForm(false);
  };

  const handleUpload = (type, file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [type]: { name: file.name, url }
      }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Step 1: Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">First Name</label>
                <input 
                  type="text" name="firstName" value={formData.firstName} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1 italic">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Last Name</label>
                <input 
                  type="text" name="lastName" value={formData.lastName} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1 italic">{errors.lastName}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Date of Birth</label>
                <input 
                  type="date" name="dob" value={formData.dob} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.dob ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.dob && <p className="text-red-500 text-xs mt-1 italic">{errors.dob}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gender</label>
                <div className="flex gap-4 mt-2">
                  {['Male', 'Female', 'Other'].map(g => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" name="gender" value={g} checked={formData.gender === g} onChange={handleInputChange}
                        className="w-4 h-4 accent-[#800000]"
                      />
                      <span className="text-sm font-semibold">{g}</span>
                    </label>
                  ))}
                </div>
                {errors.gender && <p className="text-red-500 text-xs mt-1 italic">{errors.gender}</p>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">College</label>
                <input 
                  type="text" name="college" value={formData.college} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.college ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.college && <p className="text-red-500 text-xs mt-1 italic">{errors.college}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                <input 
                  type="password" name="password" value={formData.password} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 italic">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Confirm Password</label>
                <input 
                  type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 italic">{errors.confirmPassword}</p>}
              </div>
            </div>
            <div className="space-y-3 pt-4 border-t">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleInputChange}
                  className="mt-1 w-4 h-4 accent-[#800000]"
                />
                <div>
                  <span className={`text-sm font-semibold group-hover:text-[#800000] transition-colors ${errors.termsAccepted ? 'text-red-500' : 'text-gray-600'}`}>I agree to the Terms & Conditions</span>
                  {errors.termsAccepted && <p className="text-red-500 text-xs mt-1 italic">{errors.termsAccepted}</p>}
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox" name="notARobot" checked={formData.notARobot} onChange={handleInputChange}
                  className="mt-1 w-4 h-4 accent-[#800000]"
                />
                <div>
                  <span className={`text-sm font-semibold group-hover:text-[#800000] transition-colors ${errors.notARobot ? 'text-red-500' : 'text-gray-600'}`}>I am not a robot</span>
                  {errors.notARobot && <p className="text-red-500 text-xs mt-1 italic">{errors.notARobot}</p>}
                </div>
              </label>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Step 2: Education Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">College / University</label>
                <input 
                  type="text" name="educationCollege" value={formData.educationCollege} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.educationCollege ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.educationCollege && <p className="text-red-500 text-xs mt-1 italic">{errors.educationCollege}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Degree</label>
                <input 
                  type="text" name="degree" value={formData.degree} onChange={handleInputChange} placeholder="e.g. B.Tech"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.degree ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.degree && <p className="text-red-500 text-xs mt-1 italic">{errors.degree}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Current CGPA / Percentage</label>
                <input 
                  type="text" name="cgpa" value={formData.cgpa} onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#800000] outline-none transition-all ${errors.cgpa ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                />
                {errors.cgpa && <p className="text-red-500 text-xs mt-1 italic">{errors.cgpa}</p>}
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="text-2xl font-bold text-gray-800">Step 3: Internships & Work Experience</h2>
              {!showExpForm && (
                <button 
                  onClick={() => setShowExpForm(true)}
                  className="bg-[#800000] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#4a0000] transition-all flex items-center gap-2"
                >
                  <span className="text-xl">+</span> Add Experience
                </button>
              )}
            </div>

            {showExpForm && (
              <ExperienceForm 
                onSave={handleAddExperience} 
                onCancel={() => setShowExpForm(false)} 
              />
            )}

            <div className="space-y-4">
              {formData.experiences.length === 0 && !showExpForm && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400">No experiences added yet. (Optional)</p>
                </div>
              )}
              {formData.experiences.map((exp, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-start border-l-4 border-[#800000]">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg">{exp.role}</h4>
                    <p className="text-[#800000] font-semibold">{exp.company}</p>
                    <p className="text-xs text-gray-400 mt-1">{exp.startDate} — {exp.endDate}</p>
                    <p className="text-sm text-gray-600 mt-3">{exp.description}</p>
                  </div>
                  <button 
                    onClick={() => setFormData(prev => ({...prev, experiences: prev.experiences.filter((_, i) => i !== idx)}))}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Step 4: Profile Photo & Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <UploadSection 
                type="photo" 
                file={formData.profilePhoto} 
                onUpload={(file) => handleUpload('profilePhoto', file)} 
              />
              <UploadSection 
                type="resume" 
                file={formData.resume} 
                onUpload={(file) => handleUpload('resume', file)} 
              />
            </div>
            {(errors.profilePhoto || errors.resume) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-bold">Please complete all required uploads before continuing:</p>
                <ul className="list-disc ml-5 mt-1 text-red-500 text-xs">
                  {errors.profilePhoto && <li>{errors.profilePhoto}</li>}
                  {errors.resume && <li>{errors.resume}</li>}
                </ul>
              </div>
            )}
          </div>
        );
      case 4:
        return (
          <div className="text-center py-16 animate-fade-in flex flex-col items-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm border-2 border-green-200 bounce-animation">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-extrabold text-[#800000] mb-3">All Done!</h2>
            <p className="text-xl text-gray-600 font-medium">Your profile setup is complete.</p>
            <div className="mt-12 p-6 bg-white rounded-xl border border-gray-100 shadow-sm max-w-md w-full">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Summary</h3>
              <div className="space-y-3 text-left">
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-semibold">Name</span><span className="font-bold text-[#800000]">{formData.firstName} {formData.lastName}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-semibold">Education</span><span className="font-bold text-[#800000]">{formData.degree}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500 font-semibold">Experience</span><span className="font-bold text-[#800000]">{formData.experiences.length} added</span></div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="db-root">
      <Sidebar activeItem="profile" />
      <div className="db-main-wrapper flex flex-col bg-white overflow-hidden h-screen">
        <Header activeTab="Profile" />
        <div className="flex-1 overflow-y-auto w-full">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <ProfileStepper steps={steps} currentStep={currentStep} />
            <div className="mt-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 min-h-[500px] flex flex-col shadow-maroon-soft">
              <div className="flex-1">
                {renderStep()}
              </div>
              
              {currentStep < 4 && (
                <div className="flex justify-between mt-12 pt-6 border-t border-gray-50">
                  <button 
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className={`px-8 py-3 rounded-xl font-bold transition-all transition-maroon duration-200 border-2 ${
                      currentStep === 0 
                        ? 'text-gray-300 border-gray-100 cursor-not-allowed' 
                        : 'text-[#800000] border-[#800000] hover:bg-[#800000] hover:text-white shadow-sm'
                    }`}
                  >
                    Previous
                  </button>
                  <button 
                    onClick={nextStep}
                    className="px-10 py-3 bg-[#800000] text-white rounded-xl font-bold hover:bg-[#4a0000] shadow-maroon-intense hover:scale-105 transition-all transform duration-200"
                  >
                    {currentStep === 3 ? 'Finish' : 'Continue'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .shadow-maroon-soft {
          box-shadow: 0 10px 40px -10px rgba(128, 0, 0, 0.08);
        }
        .shadow-maroon-intense {
          box-shadow: 0 4px 20px -5px rgba(128, 0, 0, 0.4);
        }
        .bounce-animation {
          animation: bounce 1s infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @media (max-width: 768px) {
          .max-w-5xl { padding: 4px; }
          .p-8 { padding: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default StudentProfile;
