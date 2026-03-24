import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import ProfileStepper from '../components/ProfileStepper';
import ExperienceForm from '../components/ExperienceForm';
import UploadSection from '../components/UploadSection';
import ProfileCardView from '../components/dashboard/ProfileCardView';
import AccountSettingsView from '../components/dashboard/AccountSettingsView';
import { authFetch, API_BASE } from '../services/api';
import { getProfile, updateProfile } from '../services/studentService';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const BACKEND_URL = API_BASE.replace('/api', '');

const steps = [
  "Personal Information",
  "Professional Summary",
  "Education",
  "Skills",
  "Projects",
  "Internships & Experience",
  "Certifications & Documents",
  "Resume Preview",
  "All Done"
];

export default function StudentProfile({ isPortal = false }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState("wizard"); // wizard, card, settings
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const data = await getProfile();
      if (data) {
        setProfileData(data);
        
        // If profile is completed, show card view by default
        if (data.profile_completed === 1 || data.profile_completed === true) {
          setViewMode("card");
        }

        // Apply dark mode if set
        if (data.dark_mode === 1 || data.dark_mode === true) {
          document.documentElement.classList.add('dark');
          document.body.classList.add('dark-mode');
        }

        setBasicInfo({
          firstName: data.first_name || (data.name ? data.name.split(' ')[0] : ''),
          lastName: data.last_name || (data.name ? data.name.split(' ').slice(1).join(' ') : ''),
          email: data.email || '',
          dob: data.dob ? data.dob.split('T')[0] : '',
          gender: data.gender || '',
          phone: data.phone || '',
          countryCode: data.country_code || '+91',
          location: data.location || '',
          college: data.college || '',
          agreed: true,
          notRobot: true
        });
        setSummary(data.summary || '');
        setEducation({
          college: data.college || '',
          degree: data.degree || '',
          specialization: data.specialization || '',
          startYear: data.edu_start_year || '',
          endYear: data.edu_end_year || '',
          cgpa: data.cgpa || ''
        });
        
        setSkills(data.skills || '');
        setTools(data.tools_technologies || '');
        
        let parsedProjects = [];
        if (data.projects) {
          try {
            parsedProjects = typeof data.projects === 'string' ? JSON.parse(data.projects) : data.projects;
          } catch (e) {
            console.error("Error parsing projects:", e);
            parsedProjects = data.projects ? [{ title: 'My Project', description: data.projects, technologies: '' }] : [];
          }
        }
        setProjectList(Array.isArray(parsedProjects) ? parsedProjects : []);
        
        setCertifications(data.certifications || '');
        
        let parsedInternships = [];
        if (data.internships) {
          try {
            parsedInternships = typeof data.internships === 'string' ? JSON.parse(data.internships) : data.internships;
          } catch (e) {
            console.error("Error parsing internships:", e);
          }
        }
        setExperiences(parsedInternships || []);
        
        if (data.profile_photo_url) {
          const cleanPath = data.profile_photo_url.replace(/\\/g, '/');
          const photoUrl = cleanPath.startsWith('http') 
            ? cleanPath 
            : `${BACKEND_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
          setDocuments(prev => ({ ...prev, photo: { url: photoUrl, name: 'Current Photo' } }));
        }
        if (data.resume_url) {
          setDocuments(prev => ({ ...prev, resume: { name: 'Current Resume', url: data.resume_url } }));
        }
      }
    } catch (err) {
      console.error("Error fetching initial profile data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);


  // Step 1
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dob: '',
    gender: '',
    phone: '',
    countryCode: '+91',
    location: '',
    college: '',
    agreed: false,
    notRobot: false
  });
  const [basicErrors, setBasicErrors] = useState({});

  // Step 2
  const [summary, setSummary] = useState('');

  // Step 3
  const [education, setEducation] = useState({
    college: '',
    degree: '',
    specialization: '',
    startYear: '',
    endYear: '',
    cgpa: ''
  });
  const [educationErrors, setEducationErrors] = useState({});

  // Step 4 (Skills)
  const [skills, setSkills] = useState('');
  const [tools, setTools] = useState('');
  const [skillsErrors, setSkillsErrors] = useState({});

  // Step 5 (Projects)
  const [projectList, setProjectList] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [currentProject, setCurrentProject] = useState({ title: '', description: '', technologies: '' });

  // Step 6 (Experience)
  const [experiences, setExperiences] = useState([]);
  const [showExpForm, setShowExpForm] = useState(false);

  // Step 7 (Certifications & Documents)
  const [certifications, setCertifications] = useState('');
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
    if (!basicInfo.email) errs.email = "Required";
    if (!basicInfo.dob) errs.dob = "Required";
    if (!basicInfo.gender) errs.gender = "Required";
    if (!basicInfo.phone) {
      errs.phone = "Required";
    } else if (!/^[0-9]{10}$/.test(basicInfo.phone)) {
      errs.phone = "Enter valid 10-digit phone number";
    }
    if (!basicInfo.location) errs.location = "Required";
    if (!basicInfo.college) errs.college = "Required";
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
    if (!education.specialization) errs.specialization = "Required";
    if (!education.startYear) errs.startYear = "Required";
    if (!education.endYear) errs.endYear = "Required";
    if (!education.cgpa) errs.cgpa = "Required";
    setEducationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateSkills = () => {
    const errs = {};
    if (!skills.trim()) errs.skills = "Please enter at least one skill";
    setSkillsErrors(errs);
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
    if (currentStep === 1 && !summary.trim()) return;
    if (currentStep === 2 && !validateEdu()) return;
    if (currentStep === 3 && !validateSkills()) return;
    if (currentStep === 6 && !validateDocs()) return;
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const generateResumePDF = async () => {
    const element = document.getElementById('resume-preview-content');
    if (!element) return;
    
    // Ensure element is visible and has white background for capture
    const originalStyle = element.style.cssText;
    element.style.boxShadow = 'none';
    element.style.border = 'none';
    
    try {
      const canvas = await html2canvas(element, { 
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // If image is taller than PDF page, scale it down to fit one page
      let finalHeight = imgHeight;
      let finalWidth = imgWidth;
      if (imgHeight > pdfHeight) {
        const ratio = pdfHeight / imgHeight;
        finalHeight = pdfHeight;
        finalWidth = imgWidth * ratio;
      }
      
      const xOffset = (pdfWidth - finalWidth) / 2;
      
      pdf.addImage(imgData, 'PNG', xOffset, 0, finalWidth, finalHeight);
      pdf.save(`${basicInfo.firstName}_${basicInfo.lastName}_Resume.pdf`);
    } catch (error) {
      console.error("PDF Generation Error:", error);
    } finally {
      element.style.cssText = originalStyle;
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submitProfile = async () => {
    if (!validateDocs()) return;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      let photoUrl = "";
      let resumeUrl = "";

      if (documents.photo?.file) {
        const formData = new FormData();
        formData.append("photo", documents.photo.file);
        const res = await authFetch("/upload/photo", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) photoUrl = data.data.url;
      }

      if (documents.resume?.file) {
        const formData = new FormData();
        formData.append("resume", documents.resume.file);
        const res = await authFetch("/upload/resume", { method: "POST", body: formData });
        const data = await res.json();
        if (data.success) resumeUrl = data.data.url;
      }

      const payload = {
        name: `${basicInfo.firstName} ${basicInfo.lastName}`.trim(),
        first_name: basicInfo.firstName,
        last_name: basicInfo.lastName,
        email: basicInfo.email,
        dob: basicInfo.dob,
        gender: basicInfo.gender,
        phone: basicInfo.phone,
        country_code: basicInfo.countryCode,
        location: basicInfo.location,
        summary: summary,
        college: basicInfo.college || education.college,
        degree: education.degree,
        specialization: education.specialization,
        edu_start_year: education.startYear,
        edu_end_year: education.endYear,
        cgpa: education.cgpa,
        skills: skills,
        tools_technologies: tools,
        projects: projectList,
        internships: experiences,
        certifications: certifications,
        profile_photo_url: photoUrl || profileData?.profile_photo_url,
        resume_url: resumeUrl || profileData?.resume_url,
        profile_completed: 1
      };

      const data = await updateProfile(payload);

      if (data) {
        setCurrentStep(8); // "All Done" is the last step
        // Refresh profile data to avoid stale state if user switches views
        setTimeout(fetchInitialData, 2000);
      } else {
        throw new Error("Failed to save profile");
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#800000]"></div>
      </div>
    );
  }

  return (
    <div className={isPortal ? "profile-wizard-portal" : "db-root"}>
      {!isPortal && <Sidebar activeItem="profile" />}
      <div className={isPortal ? "" : "db-main-wrapper"}>
        {!isPortal && <Header />}
        <div className={isPortal ? "p-4" : "db-body"} style={{ display: 'block', overflowY: 'auto', padding: isPortal ? '0' : '20px' }}>
          
          {viewMode === "card" && profileData && (
            <ProfileCardView 
              profile={profileData} 
              onEdit={() => {
                setCurrentStep(0);
                setViewMode("wizard");
              }} 
              onSettings={() => setViewMode("settings")} 
            />
          )}

          {viewMode === "settings" && profileData && (
            <AccountSettingsView 
              profile={profileData} 
              onBack={() => setViewMode(profileData.profile_completed ? "card" : "wizard")} 
              onUpdate={fetchInitialData}
            />
          )}

          {viewMode === "wizard" && (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-4xl bg-white dark:bg-slate-800 shadow-sm rounded-2xl p-6 md:p-10 border border-gray-100 dark:border-slate-700 animate-fade-in mb-10">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-extrabold text-[#800000] dark:text-gray-100">My Profile</h1>
                  {profileData?.profile_completed === 1 && (
                    <button onClick={() => setViewMode("card")} className="text-[#800000] font-bold hover:underline">View Card</button>
                  )}
                </div>
                
                <ProfileStepper steps={steps} currentStep={currentStep} />

                <div className="mt-8">
                  {/* Step 0: Personal Information */}
                  {currentStep === 0 && (
                    <div className="space-y-6 animate-fade-in">
                      <h2 className="text-xl font-bold text-[#800000] dark:text-gray-200">1. Personal Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                          <input type="text" name="firstName" value={basicInfo.firstName} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="First Name" />
                          {basicErrors.firstName && <p className="text-red-500 text-xs mt-1">{basicErrors.firstName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                          <input type="text" name="lastName" value={basicInfo.lastName} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="Last Name" />
                          {basicErrors.lastName && <p className="text-red-500 text-xs mt-1">{basicErrors.lastName}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                          <input type="email" name="email" value={basicInfo.email} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="Email" />
                          {basicErrors.email && <p className="text-red-500 text-xs mt-1">{basicErrors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
                          <div className="flex gap-2">
                            <select name="countryCode" value={basicInfo.countryCode || "+91"} onChange={handleBasicChange} className="w-1/3 p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900">
                              <option value="+91">+91 (IN)</option>
                              <option value="+1">+1 (US)</option>
                            </select>
                            <input type="tel" name="phone" value={basicInfo.phone || ""} onChange={handleBasicChange} maxLength="10" placeholder="10-digit number" className="w-2/3 p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" />
                          </div>
                          {basicErrors.phone && <p className="text-red-500 text-xs mt-1">{basicErrors.phone}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                          <input type="date" name="dob" value={basicInfo.dob} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" />
                          {basicErrors.dob && <p className="text-red-500 text-xs mt-1">{basicErrors.dob}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                          <select name="gender" value={basicInfo.gender} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900">
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          {basicErrors.gender && <p className="text-red-500 text-xs mt-1">{basicErrors.gender}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Location (City, State)</label>
                          <input type="text" name="location" value={basicInfo.location} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="E.g. Mumbai, Maharashtra" />
                          {basicErrors.location && <p className="text-red-500 text-xs mt-1">{basicErrors.location}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">College</label>
                          <input type="text" name="college" value={basicInfo.college} onChange={handleBasicChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="College Name" />
                          {basicErrors.college && <p className="text-red-500 text-xs mt-1">{basicErrors.college}</p>}
                        </div>
                      </div>
                      <div className="space-y-2 mt-4">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" name="agreed" checked={basicInfo.agreed} onChange={handleBasicChange} className="w-4 h-4 text-[#800000] rounded focus:ring-[#800000]" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-bold">I agree to Terms & Conditions</span>
                        </label>
                        {basicErrors.agreed && <p className="text-red-500 text-xs">{basicErrors.agreed}</p>}

                        <label className="flex items-center space-x-2">
                          <input type="checkbox" name="notRobot" checked={basicInfo.notRobot} onChange={handleBasicChange} className="w-4 h-4 text-[#800000] rounded focus:ring-[#800000]" />
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-bold">I am not a robot</span>
                        </label>
                        {basicErrors.notRobot && <p className="text-red-500 text-xs">{basicErrors.notRobot}</p>}
                      </div>
                      <div className="flex justify-end pt-4">
                        <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                      </div>
                    </div>
                  )}

                  {/* Step 1: Professional Summary */}
                  {currentStep === 1 && (
                    <div className="space-y-6 animate-fade-in">
                      <h2 className="text-xl font-bold text-[#800000] dark:text-gray-200">2. Professional Summary</h2>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Short description (2–3 lines about yourself)</label>
                        <textarea 
                          value={summary} 
                          onChange={(e) => setSummary(e.target.value)}
                          className="w-full p-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900 min-h-[150px]" 
                          placeholder="E.g. Passionate Software Developer with experience in React and Node.js. Focused on building scalable web applications and solving complex problems."
                        />
                      </div>
                      <div className="flex justify-between pt-4">
                        <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                        <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Education */}
                  {currentStep === 2 && (
                    <div className="space-y-6 animate-fade-in">
                      <h2 className="text-xl font-bold text-[#800000] dark:text-gray-200">3. Education</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">College / University Name</label>
                          <input type="text" name="college" value={education.college} onChange={handleEduChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="University Name" />
                          {educationErrors.college && <p className="text-red-500 text-xs mt-1">{educationErrors.college}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Degree</label>
                          <input type="text" name="degree" value={education.degree} onChange={handleEduChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="E.g. B.Tech Computer Science" />
                          {educationErrors.degree && <p className="text-red-500 text-xs mt-1">{educationErrors.degree}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Specialization</label>
                          <input type="text" name="specialization" value={education.specialization} onChange={handleEduChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="E.g. AI & ML" />
                          {educationErrors.specialization && <p className="text-red-500 text-xs mt-1">{educationErrors.specialization}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Start Year</label>
                          <input type="text" name="startYear" value={education.startYear} onChange={handleEduChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="E.g. 2021" />
                          {educationErrors.startYear && <p className="text-red-500 text-xs mt-1">{educationErrors.startYear}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">End Year (or Expected)</label>
                          <input type="text" name="endYear" value={education.endYear} onChange={handleEduChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="E.g. 2025" />
                          {educationErrors.endYear && <p className="text-red-500 text-xs mt-1">{educationErrors.endYear}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Current CGPA / Percentage</label>
                          <input type="text" name="cgpa" value={education.cgpa} onChange={handleEduChange} className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900" placeholder="E.g. 8.5 or 85%" />
                          {educationErrors.cgpa && <p className="text-red-500 text-xs mt-1">{educationErrors.cgpa}</p>}
                        </div>
                      </div>
                      <div className="flex justify-between pt-4">
                        <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                        <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Skills */}
                  {currentStep === 3 && (
                    <div className="space-y-6 animate-fade-in">
                      <h2 className="text-xl font-bold text-[#800000] dark:text-gray-200">4. Skills</h2>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Technical Skills (Comma separated)</label>
                          <textarea 
                            value={skills} 
                            onChange={(e) => setSkills(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900 min-h-[100px]" 
                            placeholder="E.g. JavaScript, React, Node.js, Python, Java"
                          />
                          {skillsErrors.skills && <p className="text-red-500 text-xs mt-1">{skillsErrors.skills}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Tools & Technologies</label>
                          <textarea 
                            value={tools} 
                            onChange={(e) => setTools(e.target.value)}
                            className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900 min-h-[100px]" 
                            placeholder="E.g. Git, Docker, VS Code, Figma, AWS"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between pt-4">
                        <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                        <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                      </div>
                    </div>
                  )}

                  {/* Step 4: Projects */}
                  {currentStep === 4 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#800000] dark:text-gray-200">5. Projects</h2>
                        <button onClick={() => setShowProjectForm(true)} className="text-sm bg-[#800000] text-white px-4 py-2 rounded-lg font-bold">+ Add Project</button>
                      </div>

                      {showProjectForm && (
                        <div className="p-6 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900 space-y-4">
                          <input type="text" placeholder="Project Title" value={currentProject.title} onChange={(e) => setCurrentProject({...currentProject, title: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-slate-800" />
                          <textarea placeholder="Description" value={currentProject.description} onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-slate-800 h-24" />
                          <input type="text" placeholder="Technologies (Comma separated)" value={currentProject.technologies} onChange={(e) => setCurrentProject({...currentProject, technologies: e.target.value})} className="w-full p-3 border rounded-lg dark:bg-slate-800" />
                          <div className="flex gap-3">
                            <button onClick={() => {
                              if (currentProject.title) {
                                setProjectList([...projectList, currentProject]);
                                setCurrentProject({ title: '', description: '', technologies: '' });
                                setShowProjectForm(false);
                              }
                            }} className="bg-[#800000] text-white px-4 py-2 rounded-lg font-bold">Save Project</button>
                            <button onClick={() => setShowProjectForm(false)} className="bg-gray-200 px-4 py-2 rounded-lg font-bold">Cancel</button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        {projectList.map((p, i) => (
                          <div key={i} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl flex justify-between items-start bg-white dark:bg-slate-900/40">
                            <div>
                              <h4 className="font-bold text-[#800000] dark:text-[#ff9999]">{p.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{p.description}</p>
                              <p className="text-xs text-gray-500 mt-2 font-bold">Tech: {p.technologies}</p>
                            </div>
                            <button onClick={() => setProjectList(projectList.filter((_, idx) => idx !== i))} className="text-red-500 font-bold text-sm">Remove</button>
                          </div>
                        ))}
                        {projectList.length === 0 && !showProjectForm && <div className="text-center py-10 text-gray-400 font-bold border-2 border-dashed rounded-xl">No projects added.</div>}
                      </div>

                      <div className="flex justify-between pt-4">
                        <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                        <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                      </div>
                    </div>
                  )}

                  {/* Step 5: Experience */}
                  {currentStep === 5 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-[#800000] dark:text-gray-200">6. Internships / Work Experience</h2>
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

                      <div className="space-y-4">
                        {experiences.map((exp, idx) => (
                          <div key={idx} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 flex justify-between items-start shadow-sm">
                            <div>
                              <h4 className="font-bold text-[#800000] dark:text-[#ff9999] text-lg">{exp.role}</h4>
                              <p className="text-sm text-gray-700 dark:text-gray-300 font-bold mb-1">{exp.company}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 font-semibold">{exp.startDate} to {exp.endDate}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{exp.description}</p>
                            </div>
                            <button onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 text-sm font-bold bg-white dark:bg-slate-800 px-3 py-1 rounded-md border border-red-200 dark:border-red-900 shadow-sm transition-colors">Remove</button>
                          </div>
                        ))}
                        {experiences.length === 0 && !showExpForm && <div className="text-center py-10 text-gray-500 dark:text-gray-400 border-2 border-dashed border-[#800000]/20 rounded-xl bg-gray-50 dark:bg-slate-900/30 font-bold">No experience added yet. (Optional)</div>}
                      </div>

                      <div className="flex justify-between pt-4">
                        <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                        <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                      </div>
                    </div>
                  )}

                  {/* Step 6: Certifications & Documents */}
                  {currentStep === 6 && (
                    <div className="space-y-6 animate-fade-in">
                      <h2 className="text-xl font-bold text-[#800000] dark:text-gray-200">7. Certifications & Documents</h2>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Certifications (Optional)</label>
                        <textarea 
                          value={certifications} 
                          onChange={(e) => setCertifications(e.target.value)}
                          className="w-full p-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#800000] focus:border-transparent outline-none dark:bg-slate-900 min-h-[100px]" 
                          placeholder="E.g. AWS Certified Solutions Architect; Google Cloud Professional Data Engineer"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
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
                        </div>
                        <div className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm">
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
                        </div>
                      </div>
                      <div className="flex justify-between pt-8">
                        <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                        <button onClick={nextStep} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">Continue</button>
                      </div>
                    </div>
                  )}

                  {/* Step 7: Resume Preview */}
                  {currentStep === 7 && (
                    <div className="space-y-6 animate-fade-in">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-[#800000] dark:text-gray-200">8. Resume Preview</h2>
                        <button onClick={generateResumePDF} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           Download PDF
                        </button>
                      </div>
                      <div id="resume-preview-content" className="bg-white text-black p-6 md:p-8 w-full max-w-[8.26in] mx-auto overflow-hidden shadow-none border-0" style={{ fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif', minHeight: '11.69in', color: '#000000', backgroundColor: '#ffffff', lineHeight: '1.4' }}>
                        {/* Header Section */}
                        <div className="text-center mb-3">
                          <h1 className="font-bold uppercase tracking-tight mb-0.5" style={{ fontSize: '22px' }}>{basicInfo.firstName} {basicInfo.lastName}</h1>
                          <div className="flex justify-center items-center flex-wrap gap-x-2" style={{ fontSize: '12px' }}>
                            <span>{basicInfo.email}</span>
                            <span>|</span>
                            <span>{basicInfo.countryCode} {basicInfo.phone}</span>
                            <span>|</span>
                            <span>{basicInfo.location}</span>
                          </div>
                          <hr className="border-t border-black mt-1.5 mb-0" />
                        </div>

                        {/* Professional Summary */}
                        {summary && (
                          <div className="mb-3">
                            <h3 className="font-bold uppercase border-b border-black mb-1 pb-0.5" style={{ fontSize: '14px' }}>Summary</h3>
                            <p className="text-justify" style={{ fontSize: '12px' }}>{summary}</p>
                          </div>
                        )}

                        {/* Education */}
                        <div className="mb-3">
                          <h3 className="font-bold uppercase border-b border-black mb-1 pb-0.5" style={{ fontSize: '14px' }}>Education</h3>
                          <div className="mb-1">
                            <div className="flex justify-between items-start" style={{ fontSize: '12px' }}>
                              <div className="font-bold">{education.college}</div>
                              <div className="text-right whitespace-nowrap">{education.startYear} – {education.endYear}</div>
                            </div>
                            <div className="flex justify-between items-start" style={{ fontSize: '12px' }}>
                              <div>{education.degree} in {education.specialization}</div>
                              <div className="text-right font-bold whitespace-nowrap">CGPA: {education.cgpa}</div>
                            </div>
                          </div>
                        </div>

                        {/* Technical Skills */}
                        {(skills || tools) && (
                          <div className="mb-3">
                            <h3 className="font-bold uppercase border-b border-black mb-1 pb-0.5" style={{ fontSize: '14px' }}>Technical Skills</h3>
                            <div className="space-y-0.5" style={{ fontSize: '12px' }}>
                              {skills && <p><span className="font-bold">Languages/Frameworks:</span> {skills}</p>}
                              {tools && <p><span className="font-bold">Tools & Technologies:</span> {tools}</p>}
                            </div>
                          </div>
                        )}

                        {/* Projects */}
                        {projectList.length > 0 && (
                          <div className="mb-3">
                            <h3 className="font-bold uppercase border-b border-black mb-1 pb-0.5" style={{ fontSize: '14px' }}>Projects</h3>
                            {projectList.map((p, i) => (
                              <div key={i} className="mb-2">
                                <div className="font-bold" style={{ fontSize: '12px' }}>{p.title}</div>
                                <div style={{ fontSize: '12px' }}>
                                  <p className="leading-snug">• {p.description}</p>
                                  {p.technologies && <p className="leading-snug text-xs italic">• Tech: {p.technologies}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Experience */}
                        {experiences.length > 0 && (
                          <div className="mb-3">
                            <h3 className="font-bold uppercase border-b border-black mb-1 pb-0.5" style={{ fontSize: '14px' }}>Experience</h3>
                            {experiences.map((exp, i) => (
                              <div key={i} className="mb-2">
                                <div className="flex justify-between items-baseline font-bold" style={{ fontSize: '12px' }}>
                                  <span>{exp.company} — {exp.role}</span>
                                  <span className="whitespace-nowrap">{exp.startDate} – {exp.endDate}</span>
                                </div>
                                <p className="mt-0.5 leading-snug" style={{ fontSize: '12px' }}>• {exp.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Certifications */}
                        {certifications && (
                          <div className="mb-3">
                            <h3 className="font-bold uppercase border-b border-black mb-1 pb-0.5" style={{ fontSize: '14px' }}>Certifications</h3>
                            <div className="whitespace-pre-wrap leading-snug" style={{ fontSize: '12px' }}>
                              {certifications.split('\n').filter(Boolean).map((cert, idx) => (
                                <span key={idx} className="block">• {cert}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between pt-8">
                        <button onClick={prevStep} className="px-8 py-3 rounded-lg font-bold text-[#800000] bg-[#800000]/10 hover:bg-[#800000]/20 transition-colors">Previous</button>
                        <button onClick={submitProfile} disabled={isSubmitting} className="bg-[#800000] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#4a0000] transition-colors">{isSubmitting ? "Saving..." : "Save & Finish"}</button>
                      </div>
                    </div>
                  )}

                  {/* Step 8: All Done */}
                  {currentStep === 8 && (
                    <div className="text-center space-y-6 animate-fade-in py-10">
                      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <svg className="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h2 className="text-4xl font-extrabold text-[#800000] dark:text-gray-100 mb-2">Profile Completed!</h2>
                      <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold">Your resume-based profile has been updated successfully.</p>
                      
                      <div className="flex justify-center gap-4 mt-8">
                        <button onClick={() => setViewMode("card")} className="bg-[#800000] text-white px-8 py-3 rounded-xl font-bold">View My Card</button>
                        <button onClick={generateResumePDF} className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold">Download Resume PDF</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

