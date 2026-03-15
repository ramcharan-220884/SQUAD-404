import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import ProfileStepper from '../components/ProfileStepper';
import ExperienceForm from '../components/ExperienceForm';
import UploadSection from '../components/UploadSection';

const steps = [
  "Let's get you started",
  "Current / Most Recent Education",
  "Internships and Work Experience",
  "Profile Photo & Documents",
  "All Done"
];

export default function StudentProfile() {
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    college: '',
    password: '',
    confirmPassword: '',
    agreed: false,
    notRobot: false
  });
  const [basicErrors, setBasicErrors] = useState({});

  // Step 2
  const [education, setEducation] = useState({
    college: '',
    degree: '',
    cgpa: ''
  });
  const [educationErrors, setEducationErrors] = useState({});

  // Step 3
  const [experiences, setExperiences] = useState([]);
  const [showExpForm, setShowExpForm] = useState(false);

  // Step 4
  const [documents, setDocuments] = useState({
    photo: null,
    resume: null
  });
  const [docErrors, setDocErrors] = useState({});

  // Handlers
  const handleBasicChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBasicInfo({
      ...basicInfo,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const validateBasic = () => {
    const errs = {};
    if (!basicInfo.firstName) errs.firstName = "Required";
    if (!basicInfo.lastName) errs.lastName = "Required";
    if (!basicInfo.dob) errs.dob = "Required";
    if (!basicInfo.gender) errs.gender = "Required";
    if (!basicInfo.college) errs.college = "Required";
    if (!basicInfo.password) errs.password = "Required";
    if (basicInfo.password && basicInfo.password !== basicInfo.confirmPassword) errs.confirmPassword = "Passwords must match";
    if (!basicInfo.agreed) errs.agreed = "You must agree to T&C";
    if (!basicInfo.notRobot) errs.notRobot = "Please confirm you are not a robot";
    setBasicErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleEduChange = (e) => {
    setEducation({ ...education, [e.target.name]: e.target.value });
  };

  const validateEdu = () => {
    const errs = {};
    if (!education.college) errs.college = "Required";
    if (!education.degree) errs.degree = "Required";
    if (!education.cgpa) errs.cgpa = "Required";
    setEducationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateDocs = () => {
    const errs = {};
    if (!documents.photo) errs.photo = "Required";
    if (!documents.resume) errs.resume = "Required";
    setDocErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 0 && !validateBasic()) return;
    if (currentStep === 1 && !validateEdu()) return;
    if (currentStep === 3 && !validateDocs()) return;
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="db-root">
      <Sidebar activeItem="profile" />
      <div className="db-main-wrapper">
        <Header />
        <div className="db-body" style={{ display: 'block', overflowY: 'auto', padding: '20px' }}>
          
          <div className="flex flex-col items-center">
            <div className="w-full max-w-4xl bg-white shadow-sm rounded-2xl p-6 md:p-10 border border-gray-100 animate-fade-in mb-10">
              <h1 className="text-3xl font-extrabold text-[#800000] mb-6 text-center">My Profile</h1>
              
              <ProfileStepper steps={steps} currentStep={currentStep} />

              <div className="mt-8">
                {/* Step 1 */}
                {currentStep === 0 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-[#800000]">1. Let's get you started</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">First Name</label>
                        <input type="text" name="firstName" value={basicInfo.firstName} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" placeholder="First Name" />
                        {basicErrors.firstName && <p className="text-red-500 text-xs mt-1">{basicErrors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Last Name</label>
                        <input type="text" name="lastName" value={basicInfo.lastName} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" placeholder="Last Name" />
                        {basicErrors.lastName && <p className="text-red-500 text-xs mt-1">{basicErrors.lastName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Date of Birth</label>
                        <input type="date" name="dob" value={basicInfo.dob} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" />
                        {basicErrors.dob && <p className="text-red-500 text-xs mt-1">{basicErrors.dob}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Gender</label>
                        <select name="gender" value={basicInfo.gender} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none">
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        {basicErrors.gender && <p className="text-red-500 text-xs mt-1">{basicErrors.gender}</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 mb-1">College</label>
                        <input type="text" name="college" value={basicInfo.college} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" placeholder="College Name" />
                        {basicErrors.college && <p className="text-red-500 text-xs mt-1">{basicErrors.college}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
                        <input type="password" name="password" value={basicInfo.password} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" placeholder="Enter Password" />
                        {basicErrors.password && <p className="text-red-500 text-xs mt-1">{basicErrors.password}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirm Password</label>
                        <input type="password" name="confirmPassword" value={basicInfo.confirmPassword} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" placeholder="Confirm Password" />
                        {basicErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{basicErrors.confirmPassword}</p>}
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="agreed" checked={basicInfo.agreed} onChange={handleBasicChange} className="w-4 h-4 text-[#800000] rounded focus:ring-[#800000]" />
                        <span className="text-sm text-gray-700 font-bold">I agree to Terms & Conditions</span>
                      </label>
                      {basicErrors.agreed && <p className="text-red-500 text-xs">{basicErrors.agreed}</p>}

                      <label className="flex items-center space-x-2">
                        <input type="checkbox" name="notRobot" checked={basicInfo.notRobot} onChange={handleBasicChange} className="w-4 h-4 text-[#800000] rounded focus:ring-[#800000]" />
                        <span className="text-sm text-gray-700 font-bold">I am not a robot</span>
                      </label>
                      {basicErrors.notRobot && <p className="text-red-500 text-xs">{basicErrors.notRobot}</p>}
                    </div>
                    <div className="flex justify-end pt-4">
                      <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                    </div>
                  </div>
                )}

                {/* Step 2 */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-[#800000]">2. Current / Most Recent Education</h2>
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">College / University</label>
                        <input type="text" name="college" value={education.college} onChange={handleEduChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" placeholder="University Name" />
                        {educationErrors.college && <p className="text-red-500 text-xs mt-1">{educationErrors.college}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Degree</label>
                        <input type="text" name="degree" value={education.degree} onChange={handleEduChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" placeholder="E.g. B.Tech Computer Science" />
                        {educationErrors.degree && <p className="text-red-500 text-xs mt-1">{educationErrors.degree}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Current CGPA / Percentage</label>
                        <input type="text" name="cgpa" value={education.cgpa} onChange={handleEduChange} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none" placeholder="E.g. 8.5 or 85%" />
                        {educationErrors.cgpa && <p className="text-red-500 text-xs mt-1">{educationErrors.cgpa}</p>}
                      </div>
                    </div>
                    <div className="flex justify-between pt-4">
                      <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                      <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-[#800000]">3. Internships and Work Experience</h2>
                      <button onClick={() => setShowExpForm(true)} className="text-sm bg-[#800000] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#4a0000] transition-colors shadow-sm">+ Add Experience</button>
                    </div>
                    
                    {showExpForm && (
                      <ExperienceForm 
                        onSave={(exp) => {
                          setExperiences([...experiences, exp]);
                          setShowExpForm(false);
                        }} 
                        onCancel={() => setShowExpForm(false)} 
                      />
                    )}

                    {experiences.length > 0 ? (
                      <div className="space-y-4">
                        {experiences.map((exp, idx) => (
                          <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50 flex justify-between items-start shadow-sm">
                            <div>
                              <h4 className="font-bold text-[#800000] text-lg">{exp.role}</h4>
                              <p className="text-sm text-gray-700 font-bold mb-1">{exp.company}</p>
                              <p className="text-xs text-gray-500 font-semibold">{exp.startDate} to {exp.endDate}</p>
                              <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                            </div>
                            <button onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-bold bg-white px-3 py-1 rounded-md border border-red-200 shadow-sm transition-colors">Remove</button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      !showExpForm && <div className="text-center py-10 text-gray-500 border-2 border-dashed border-[#800000]/20 rounded-xl bg-gray-50 font-bold">No experience added yet. (Optional)</div>
                    )}

                    <div className="flex justify-between pt-4">
                      <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                      <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                    </div>
                  </div>
                )}

                {/* Step 4 */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="text-xl font-bold text-[#800000]">4. Profile Photo & Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                        <UploadSection 
                          type="photo" 
                          file={documents.photo} 
                          onUpload={(file) => {
                            if (file) {
                              const url = URL.createObjectURL(file);
                              setDocuments({...documents, photo: { file, url, name: file.name }});
                            } else {
                              setDocuments({...documents, photo: null});
                            }
                          }} 
                        />
                        {docErrors.photo && <p className="text-red-500 text-xs mt-3 text-center font-bold">{docErrors.photo}</p>}
                      </div>
                      <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 shadow-sm">
                        <UploadSection 
                          type="resume" 
                          file={documents.resume} 
                          onUpload={(file) => {
                            if (file) {
                              setDocuments({...documents, resume: { file, name: file.name }});
                            } else {
                              setDocuments({...documents, resume: null});
                            }
                          }} 
                        />
                        {docErrors.resume && <p className="text-red-500 text-xs mt-3 text-center font-bold">{docErrors.resume}</p>}
                      </div>
                    </div>
                    <div className="flex justify-between pt-8">
                      <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                      <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Finish</button>
                    </div>
                  </div>
                )}

                {/* Step 5 */}
                {currentStep === 4 && (
                  <div className="text-center space-y-6 animate-fade-in py-10">
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                      <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-4xl font-extrabold text-[#800000] mb-2">All Done!</h2>
                    <p className="text-gray-600 text-lg font-semibold">Your profile setup is complete.</p>
                    
                    <div className="bg-gray-50 rounded-2xl p-8 max-w-lg mx-auto text-left border border-gray-200 mt-8 shadow-sm">
                      <h3 className="font-bold text-xl mb-6 text-[#800000] border-b-2 border-[#800000]/10 pb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Profile Summary
                      </h3>
                      <div className="space-y-4 text-sm">
                        <div className="flex p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                          <span className="font-bold text-gray-500 w-28 shrink-0">Name</span> 
                          <span className="font-bold text-gray-900">{basicInfo.firstName} {basicInfo.lastName}</span>
                        </div>
                        <div className="flex p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                          <span className="font-bold text-gray-500 w-28 shrink-0">Education</span> 
                          <span className="font-bold text-gray-900">{education.degree} at {education.college}</span>
                        </div>
                        <div className="flex p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                          <span className="font-bold text-gray-500 w-28 shrink-0">Experience</span> 
                          <span className="font-bold text-gray-900 bg-[#800000]/10 text-[#800000] px-2 py-0.5 rounded">{experiences.length} records</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
