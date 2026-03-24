import React, { useEffect, useState } from "react";

import { useNotification } from "../context/NotificationContext";
import { getPostedJobs, getCompanyStats, postJob, updateApplicationStatus, getApplicants, getProfile, updateProfile, getCompanyApplicationRounds, createCompanyApplicationRound, updateCompanyApplicationRoundStatus } from "../services/companyService";
import socketService from "../services/socketService";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  BarChart2, 
  Settings, 
  Search, 
  Bell,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  ArrowLeft,
  GraduationCap
} from "lucide-react";
import Announcements from "../components/dashboard/Announcements";
import Competitions from "../components/dashboard/Competitions";
import Events from "../components/dashboard/Events";
import ThemeToggle from "../components/dashboard/ThemeToggle";
import CompanySidebar from "../components/dashboard/CompanySidebar";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function CompanyDashboard() {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState("Home");
  const [, setJobs] = useState([]);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postJobFormData, setPostJobFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    salary: "",
    deadline: "",
    description: "",
    skills: "",
    experience: "",
    min_cgpa: ""
  });
  const [formErrors, setFormErrors] = useState({});

  // Rounds Management State
  const [showRoundsModal, setShowRoundsModal] = useState(false);
  const [selectedAppForRounds, setSelectedAppForRounds] = useState(null);
  const [appRounds, setAppRounds] = useState([]);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [newRoundForm, setNewRoundForm] = useState({ round_name: '', date: '', time: '', location: '' });

  // New Dashboard Stats and Table State
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    studentsReached: 0,
    placementRate: "0%"
  });

  const [dashboardJobs, setDashboardJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  // Applications tab filters
  const [appSearchQuery, setAppSearchQuery] = useState("");
  const [appJobFilter, setAppJobFilter] = useState("All");
  const [appStatusFilter, setAppStatusFilter] = useState("All");

  // Analytics State Data
  const [trendData, setTrendData] = useState([]);
  const [placementData, setPlacementData] = useState([]);

  const [activeFaq, setActiveFaq] = useState(null);
  const [supportFormData, setSupportFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const faqs = [
    {
      q: "How do I post a new job?",
      a: "Click on 'Posted Jobs' in the sidebar and select 'Post New Job'. Fill in the job details and click 'Create Job Posting'."
    },
    {
      q: "How do I review student applications?",
      a: "Navigate to the 'Applications' tab. You can see applications grouped by job title. Use the dropdown to update a student's status."
    },
    {
      q: "How do I edit or delete a job posting?",
      a: "Go to 'Posted Jobs'. Find the job in the table and click the 'Edit' button. To delete, you can currently mark it as 'Closed'."
    },
    {
      q: "Why am I not receiving student applications?",
      a: "Ensure your job posting is 'Active'. You can also check if the application deadline has passed or if the student reach covers your target department."
    }
  ];

  const handleSupportFormChange = (e) => {
    const { name, value } = e.target;
    setSupportFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    showNotification("Support request submitted! We will get back to you soon.", "success", "company");
    setSupportFormData({ name: '', email: '', subject: '', message: '' });
  };

  // Live company profile from API
  const [companyProfile, setCompanyProfile] = useState({
    name: localStorage.getItem("userName") || "Your Company",
    email: localStorage.getItem("userEmail") || "",
    contact_person: "",
    contact_number: "",
    description: "",
    status: ""
  });


  const COLORS = ['#3b82f6', '#818cf8', '#f59e0b']; // Blue, Indigo, Amber

  const fetchDashboardData = React.useCallback(async () => {
    try {

      // 1. Fetch company profile
      const profileData = await getProfile();
      if (profileData) {
        setCompanyProfile({
          name: profileData.name || "Your Company",
          email: profileData.email || "",
          contact_person: profileData.contact_person || "",
          contact_number: profileData.contact_number || "",
          description: profileData.description || "",
          status: profileData.status || ""
        });
      }

      // 2. Fetch jobs (ARRAY)
      const jobsArray = await getPostedJobs();
      if (Array.isArray(jobsArray)) {
        const mappedJobs = jobsArray.map(j => ({
          ...j,
          title: j.title || "Untitled",
          department: j.department || "General",
          salary: j.package || j.ctc || j.salary || "",
          deadline: j.deadline ? new Date(j.deadline).toLocaleDateString() : "N/A",
          applications: j.applicant_count || 0,
          status: new Date(j.deadline) < new Date() ? "Closed" : "Active"
        }));
        setJobs(mappedJobs);
        setDashboardJobs(mappedJobs);
      }

      // 3. Fetch stats (all dynamic)
      const statsData = await getCompanyStats();
      if (statsData) {
        setDashboardStats({
          totalJobs: statsData.totalJobs || 0,
          totalApplications: statsData.totalApplications || 0,
          studentsReached: statsData.studentsReached || 0,
          placementRate: statsData.placementRate || "0%"
        });
      }

      // 4. Fetch applicants
      const applicants = await getApplicants();
      if (Array.isArray(applicants)) {
        // Group applicants by job
        const jobApplicantMap = {};
        applicants.forEach(app => {
          if (!jobApplicantMap[app.job_id]) jobApplicantMap[app.job_id] = [];
          jobApplicantMap[app.job_id].push({
            application_id: app.application_id,
            student_id: app.student_id,
            student_name: app.student_name,
            student_email: app.student_email,
            branch: app.branch,
            cgpa: app.cgpa,
            status: app.status || 'Applied',
            applied_at: app.applied_at,
            resume_url: app.resume_url,
            job_title: app.job_title
          });
        });

        // Merge applicant details into jobs
        setJobs(prev => prev.map(job => ({
          ...job,
          applications: jobApplicantMap[job.id]?.length || job.applications || 0,
          applicantDetails: jobApplicantMap[job.id] || []
        })));
        setDashboardJobs(prev => prev.map(job => ({
          ...job,
          applications: jobApplicantMap[job.id]?.length || job.applications || 0,
          applicantDetails: jobApplicantMap[job.id] || []
        })));

        // Compute trend data from applicants
        const monthCounts = {};
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        applicants.forEach(app => {
          if (app?.applied_at) {
            const d = new Date(app.applied_at);
            const key = monthNames[d.getMonth()];
            monthCounts[key] = (monthCounts[key] || 0) + 1;
          }
        });
        const computedTrend = Object.entries(monthCounts).map(([month, applications]) => ({ month, applications }));
        if (computedTrend.length > 0) setTrendData(computedTrend);

        // Compute placement breakdown
        const statusCounts = { Selected: 0, Shortlisted: 0, Applied: 0, Rejected: 0 };
        applicants.forEach(app => {
          const s = app?.status || 'Applied';
          if (statusCounts.hasOwnProperty(s)) {
            statusCounts[s] = (statusCounts[s] || 0) + 1;
          }
        });
        const computedPlacement = [
          { name: 'Selected', value: statusCounts.Selected },
          { name: 'In Process', value: statusCounts.Shortlisted },
          { name: 'Pending', value: statusCounts.Applied + statusCounts.Rejected }
        ].filter(d => d.value > 0);
        if (computedPlacement.length > 0) setPlacementData(computedPlacement);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      showNotification("Failed to load dashboard data", "error", "company");
    }
  }, [showNotification]);

  useEffect(() => {
    const token = localStorage.getItem("token"); 
    if (token) {
        socketService.connect(token);
        socketService.on("newApplicant", (data) => {
            showNotification(`New Applicant: ${data.studentName} applied for ${data.jobTitle}`, "info", "company");
            fetchDashboardData(); 
        });
        socketService.on("newAnnouncement", (data) => {
            showNotification(`New Announcement: ${data.title}`, "info", "company");
        });
    }

    fetchDashboardData();

    return () => {
        socketService.off("newApplicant");
        socketService.off("newAnnouncement");
    };
  }, [fetchDashboardData, showNotification]);


  const handlePostJob = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    // Comprehensive Validation
    const errors = {};
    const requiredFields = [
      'title', 'department', 'location', 'type', 'salary', 
      'deadline', 'experience', 'min_cgpa', 'description'
    ];
    
    requiredFields.forEach(field => {
      if (!postJobFormData[field] || postJobFormData[field].toString().trim() === "") {
        errors[field] = "Please fill this field";
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showNotification("Please fill in all required fields", "warning", "company");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        // Update Mode
        const updatedJobs = dashboardJobs.map(job => 
          job.id === editJobId 
            ? { 
                ...job, 
                ...postJobFormData 
              } 
            : job
        );
        setDashboardJobs(updatedJobs);
        showNotification("Job updated successfully!", "success", "company");
      } else {
        const newJobObj = {
          title: postJobFormData.title,
          department: postJobFormData.department,
          deadline: postJobFormData.deadline,
          status: "Active",
          location: postJobFormData.location,
          type: postJobFormData.type,
          ctc: postJobFormData.salary,
          description: postJobFormData.description,
          skills: postJobFormData.skills,
          experience: postJobFormData.experience,
          min_cgpa: postJobFormData.min_cgpa,
          max_backlogs: null
        };

        // Send to backend
        const res = await postJob(newJobObj);
        if (res.success) {
          const addedJob = { ...newJobObj, id: res.data.job_id, job_id: res.data.job_id, applications: 0, status: "Active" };
          setDashboardJobs([addedJob, ...dashboardJobs]);
          setDashboardStats({
            ...dashboardStats,
            totalJobs: (dashboardStats.totalJobs || 0) + 1
          });
          showNotification("Job posted successfully!", "success", "company");
        } else {
          showNotification(res.message || "Failed to post job", "error", "company");
        }
      }
    } catch (err) {
      showNotification(err.message || "Server error posting job", "error", "company");
    } finally {
      setIsSubmitting(false);
    }
    
    // Reset and close
    closePostJobModal();
  };

  const closePostJobModal = () => {
    setPostJobFormData({
      title: "",
      department: "",
      location: "",
      type: "Full-time",
      salary: "",
      deadline: "",
      description: "",
      skills: "",
      experience: "",
      min_cgpa: ""
    });
    setIsEditing(false);
    setEditJobId(null);
    setFormErrors({});
    setShowPostJobModal(false);
  };

  const handleEditClick = (job) => {
    setPostJobFormData({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "Full-time",
      salary: job.package || job.ctc || job.salary || "",
      deadline: job.deadline || "",
      description: job.description || "",
      skills: job.skills || "",
      experience: job.experience || "",
      min_cgpa: job.min_cgpa || ""
    });
    setIsEditing(true);
    setEditJobId(job.id);
    setShowPostJobModal(true);
  };

  const handlePostJobChange = (e) => {
    const { name, value } = e.target;
    setPostJobFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleStatusUpdate = async (applicationId, status) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateApplicationStatus(applicationId, status);
      showNotification(`Application status updated to ${status}`, "success", "company");
      // Update local state immutably
      const updatedJobs = dashboardJobs.map(job => ({
        ...job,
        applicantDetails: job.applicantDetails?.map(app => 
          app.application_id === applicationId ? { ...app, status } : app
        )
      }));
      setDashboardJobs(updatedJobs);
      setJobs(updatedJobs);
    } catch (err) {
      showNotification("Error updating application status", "error", "company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRoundsModal = async (app) => {
    setSelectedAppForRounds(app);
    setShowRoundsModal(true);
    setLoadingRounds(true);
    try {
      const rounds = await getCompanyApplicationRounds(app.application_id);
      setAppRounds(rounds || []);
    } catch (err) {
      showNotification("Failed to load rounds", "error", "company");
    } finally {
      setLoadingRounds(false);
    }
  };

  const handleCreateRound = async (e) => {
    e.preventDefault();
    if (!newRoundForm.round_name || !newRoundForm.date || !newRoundForm.time) {
      showNotification("Please fill all required fields", "warning", "company");
      return;
    }
    try {
      setIsSubmitting(true);
      await createCompanyApplicationRound(selectedAppForRounds.application_id, newRoundForm);
      showNotification("Round created successfully", "success", "company");
      setNewRoundForm({ round_name: '', date: '', time: '', location: '' });
      // Refresh rounds
      const rounds = await getCompanyApplicationRounds(selectedAppForRounds.application_id);
      setAppRounds(rounds || []);
    } catch (err) {
      showNotification("Error creating round", "error", "company");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoundStatusUpdate = async (roundId, status) => {
    try {
      await updateCompanyApplicationRoundStatus(roundId, status);
      showNotification("Round status updated", "success", "company");
      const rounds = await getCompanyApplicationRounds(selectedAppForRounds.application_id);
      setAppRounds(rounds || []);
    } catch (err) {
      showNotification("Error updating round", "error", "company");
    }
  };

  const renderContent = () => {
    const filteredJobs = (dashboardJobs || []).filter(job => {
      const title = job?.title || "";
      const department = job?.department || "";
      const matchSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || job?.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (activeTab === "Home") {
      // Calculate dynamic stats from dashboardStats state
      const totalJobs = dashboardStats.totalJobs;
      const totalApplications = dashboardStats.totalApplications;
      const studentsReached = dashboardStats.studentsReached;
      const placementRate = dashboardStats.placementRate;

      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-10 flex justify-between items-start">
            <div>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back, {companyProfile.name}!</h2>
              <p className="text-gray-500 text-lg mt-2 font-medium">Here's what's happening with your recruitment today.</p>
            </div>
            <ThemeToggle role="company" />
          </div>
          
          {/* Dashboard Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              { label: "Total Jobs", value: totalJobs, icon: Briefcase, color: "blue" },
              { label: "Applications", value: totalApplications, icon: FileText, color: "indigo" },
              { label: "Students Reached", value: studentsReached, icon: Users, color: "purple" },
              { label: "Placement Rate", value: placementRate, icon: BarChart2, color: "blue" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-6 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 cursor-pointer group relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-12 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-${stat.color}-500/10 transition-colors`}></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:bg-${stat.color}-600 group-hover:text-white shadow-sm transition-all duration-500`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{stat.label}</p>
                  <p className="text-5xl font-black text-gray-900 mt-2 tracking-tighter">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Posted Jobs Table Section */}
          <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 hover:shadow-xl transition-shadow duration-500">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Recent Job Postings</h2>
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-11 pr-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm outline-none w-full md:w-72 transition-all font-medium"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm outline-none cursor-pointer font-bold text-gray-700 transition-all hover:border-gray-300"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="In Review">In Review</option>
                  <option value="Closed">Closed</option>
                </select>
                <button
                  onClick={() => setActiveTab('Posted Jobs')}
                  className="text-blue-600 hover:text-blue-700 font-black text-sm hover:underline transition-all whitespace-nowrap ml-2 flex items-center gap-1 group"
                >
                  View All <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-bold">Job Title</th>
                    <th className="px-6 py-4 font-bold">Department</th>
                    <th className="px-6 py-4 font-bold">Deadline</th>
                    <th className="px-6 py-4 font-bold">Applications</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                        No jobs found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.slice(0, 5).map((job) => (
                      <tr key={job.id} className="hover:bg-[#f5f7fb] hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200">
                        <td className="px-6 py-4 font-bold text-gray-900">{job.title}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{job.department}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{job.deadline}</td>
                        <td className="px-6 py-4 text-gray-900 font-bold">{job.applications}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            job.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                            job.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                            'bg-indigo-100 text-indigo-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              job.status === 'Active' ? 'bg-blue-500' :
                              job.status === 'Closed' ? 'bg-gray-500' :
                              'bg-indigo-500'
                            }`}></span>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleEditClick(job)}
                            className="text-black hover:text-black font-bold text-sm bg-white px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 shadow-sm active:scale-95"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    } 

    if (activeTab === "Posted Jobs") {
      return (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-5">Posted Jobs</h2>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm outline-none w-full md:w-72 transition-all"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-5 py-3 bg-white border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm outline-none cursor-pointer w-full md:w-auto transition-all font-bold text-gray-700 hover:border-gray-300"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Closed">Closed</option>
                  <option value="In Review">In Review</option>
                </select>
              </div>
              <button
                onClick={() => setShowPostJobModal(true)}
                className="bg-[#3b82f6] text-white px-7 py-3 rounded-2xl hover:bg-[#2563eb] transition-all text-sm font-black flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-blue-500/20 active:scale-95 w-full md:w-auto"
              >
                <span className="text-xl leading-none font-bold">+</span> Post New Job
              </button>
            </div>
          </div>
          
          <section className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden mb-12 hover:shadow-xl transition-shadow duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                    <th className="px-6 py-4 font-bold">Job Title</th>
                    <th className="px-6 py-4 font-bold">Department</th>
                    <th className="px-6 py-4 font-bold">Deadline</th>
                    <th className="px-6 py-4 font-bold">Applications</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredJobs.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                        No jobs found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredJobs.map((job) => (
                      <tr key={job.id} className="hover:bg-[#f5f7fb] hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all duration-200 group">
                        <td className="px-6 py-4 font-bold text-gray-900">{job.title}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{job.department}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{job.deadline}</td>
                        <td className="px-6 py-4 text-gray-900 font-bold">{job.applications}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                            job.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                            job.status === 'Closed' ? 'bg-gray-100 text-gray-700' :
                            job.status === 'In Review' ? 'bg-purple-100 text-purple-700' :
                            'bg-indigo-100 text-indigo-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              job.status === 'Active' ? 'bg-blue-500' :
                              job.status === 'Closed' ? 'bg-gray-500' :
                              job.status === 'In Review' ? 'bg-purple-500' :
                              'bg-indigo-500'
                            }`}></span>
                            {job.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handleEditClick(job)}
                            className="text-black hover:text-black font-bold text-sm bg-white px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all border border-gray-200 shadow-sm active:scale-95"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "Applications") {
      // Build flat list of all applications across all jobs
      const allApplications = dashboardJobs.flatMap(job =>
        (job.applicantDetails || []).map(app => ({
          ...app,
          jobTitle: job.title,
          jobId: job.id,
        }))
      );

      // Unique job titles for the filter dropdown
      const jobTitles = ["All", ...new Set(dashboardJobs.map(j => j.title).filter(Boolean))];

      // Apply all filters
      const filteredApps = allApplications.filter(app => {
        const q = appSearchQuery.toLowerCase();
        const matchesSearch = !q ||
          (app.student_name || "").toLowerCase().includes(q) ||
          (app.student_email || "").toLowerCase().includes(q);
        const matchesJob = appJobFilter === "All" || app.jobTitle === appJobFilter;
        const matchesStatus = appStatusFilter === "All" || (app.status || "Applied") === appStatusFilter;
        return matchesSearch && matchesJob && matchesStatus;
      });

      // Summary counts from the full unfiltered list
      const totalAll   = allApplications.length;
      const totalPending     = allApplications.filter(a => !a.status || a.status === "Applied").length;
      const totalShortlisted = allApplications.filter(a => a.status === "Shortlisted").length;
      const totalSelected    = allApplications.filter(a => a.status === "Selected").length;
      const totalRejected    = allApplications.filter(a => a.status === "Rejected").length;

      const hasActiveFilters = appSearchQuery || appJobFilter !== "All" || appStatusFilter !== "All";

      return (
        <div className="animate-in fade-in duration-300">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Manage Applications</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">Search, filter and update applicant statuses across all your job postings</p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-7">
            {[
              { label: "Total", value: totalAll, color: "blue" },
              { label: "Applied", value: totalPending, color: "indigo" },
              { label: "Shortlisted", value: totalShortlisted, color: "purple" },
              { label: "Selected", value: totalSelected, color: "green" },
              { label: "Rejected", value: totalRejected, color: "red" },
            ].map((s, i) => (
              <div
                key={i}
                onClick={() => setAppStatusFilter(s.label === "Applied" ? "Applied" : s.label === "Total" ? "All" : s.label)}
                className={`bg-white rounded-2xl px-5 py-4 shadow-sm border cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${
                  (appStatusFilter === s.label || (s.label === "Total" && appStatusFilter === "All"))
                    ? `border-${s.color}-400 ring-2 ring-${s.color}-200`
                    : "border-gray-100"
                }`}
              >
                <p className={`text-xs font-black uppercase tracking-widest text-${s.color}-500 mb-1`}>{s.label}</p>
                <p className="text-3xl font-black text-gray-900">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 flex flex-col md:flex-row items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by student name or email..."
                value={appSearchQuery}
                onChange={e => setAppSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium outline-none transition-all"
              />
            </div>

            {/* Job Filter */}
            <select
              value={appJobFilter}
              onChange={e => setAppJobFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-bold text-gray-700 outline-none cursor-pointer w-full md:w-56 transition-all hover:border-gray-300"
            >
              {jobTitles.map(t => (
                <option key={t} value={t}>{t === "All" ? "All Jobs" : t}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={appStatusFilter}
              onChange={e => setAppStatusFilter(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-bold text-gray-700 outline-none cursor-pointer w-full md:w-44 transition-all hover:border-gray-300"
            >
              <option value="All">All Status</option>
              <option value="Applied">Applied</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Selected">Selected</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={() => { setAppSearchQuery(""); setAppJobFilter("All"); setAppStatusFilter("All"); }}
                className="px-5 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition-all whitespace-nowrap active:scale-95"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Result count */}
          {hasActiveFilters && (
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Showing {filteredApps.length} of {totalAll} application{totalAll !== 1 ? "s" : ""}
            </p>
          )}

          {/* Applications Table */}
          <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-8 py-5">Student</th>
                    <th className="px-8 py-5">Job Position</th>
                    <th className="px-8 py-5">Email</th>
                    <th className="px-8 py-5">Current Status</th>
                    <th className="px-8 py-5 text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allApplications.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-base font-bold text-gray-400">No applications received yet</p>
                        <p className="text-xs text-gray-300 mt-1 font-medium">Post jobs to start receiving applicants</p>
                      </td>
                    </tr>
                  ) : filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-16 text-center">
                        <Search className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-base font-bold text-gray-400">No applications match your filters</p>
                        <button
                          onClick={() => { setAppSearchQuery(""); setAppJobFilter("All"); setAppStatusFilter("All"); }}
                          className="mt-4 px-5 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-all"
                        >
                          Clear Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    filteredApps.map((app, idx) => (
                      <tr key={`${app.application_id}-${idx}`} className="hover:bg-blue-50/20 transition-colors group">
                        {/* Student */}
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                              {(app.student_name || "S").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <p className="font-bold text-gray-900 text-sm">{app.student_name || "—"}</p>
                          </div>
                        </td>

                        {/* Job */}
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold">
                            {app.jobTitle}
                          </span>
                        </td>

                        {/* Email */}
                        <td className="px-8 py-5 text-gray-500 font-medium text-sm">
                          {app.student_email || "—"}
                        </td>

                        {/* Current status badge */}
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wide ${
                            app.status === "Selected"   ? "bg-green-100 text-green-700" :
                            app.status === "Rejected"   ? "bg-red-100 text-red-700" :
                            app.status === "Shortlisted"? "bg-purple-100 text-purple-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              app.status === "Selected"    ? "bg-green-500" :
                              app.status === "Rejected"    ? "bg-red-500" :
                              app.status === "Shortlisted" ? "bg-purple-500" :
                              "bg-blue-500"
                            }`} />
                            {app.status || "Applied"}
                          </span>
                        </td>

                        {/* Update dropdown & Actions */}
                        <td className="px-8 py-5 text-right flex items-center justify-end gap-3 flex-wrap">
                          <button
                            onClick={() => openRoundsModal(app)}
                            className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors border border-blue-100 uppercase tracking-widest whitespace-nowrap active:scale-95 shadow-sm"
                          >
                            Rounds
                          </button>
                          <select
                            value={app.status || "Applied"}
                            onChange={e => handleStatusUpdate(app.application_id, e.target.value)}
                            disabled={isSubmitting}
                            className="border-2 border-gray-100 rounded-xl py-2 pl-4 pr-9 text-xs font-bold bg-white focus:border-blue-500/50 outline-none shadow-sm cursor-pointer transition-all hover:border-blue-200 hover:bg-blue-50/30 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider h-[38px]"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Selected">Selected</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "Analytics") {
      return (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Recruitment Analytics</h2>
            <p className="text-gray-500 text-sm mt-1">Track your hiring performance and applicant trends over time</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Applications Trend Bar Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Applications Trend</h3>
                <p className="text-sm text-gray-500 font-medium">Monthly application volume</p>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={trendData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6B7280', fontSize: 12, fontWeight: 500 }}
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{ fill: '#F3F4F6' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                    />
                    <Bar dataKey="applications" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Placement Overview Donut Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Placement Overview</h3>
                <p className="text-sm text-gray-500 font-medium">Status distribution of applicants</p>
              </div>
              <div className="h-72 w-full flex relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={placementData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {placementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}
                      itemStyle={{ fontWeight: 600, color: '#111827' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value, entry) => <span style={{ color: '#4B5563', fontWeight: 500, fontSize: '13px' }}>{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Text for Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                  <span className="text-3xl font-black text-gray-800">{placementData.reduce((acc, curr) => acc + curr.value, 0)}</span>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Total</span>
                </div>
              </div>
            </div>
          </div>
          

        </div>
      );
    }

    if (activeTab === "Students") {
      if (viewingProfile) {
        return (
          <div className="animate-in slide-in-from-right-8 fade-in duration-500">
            <div className="mb-6 flex items-center justify-between">
              <button 
                onClick={() => setViewingProfile(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-all group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Directory
              </button>
              <div className="flex gap-3">
                <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${
                  viewingProfile.status === 'Placed' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  viewingProfile.status === 'Interning' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  'bg-green-100 text-green-700 border-green-200'
                }`}>
                  {viewingProfile.status}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
               {/* Cover/Header Section */}
               <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#334155] px-10 py-10 text-white relative">
                  <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
                    <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl font-black border border-white/20 shadow-2xl">
                      {viewingProfile.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-4xl font-black tracking-tight mb-1">{viewingProfile.name}</h3>
                      <div className="flex flex-wrap justify-center md:justify-start gap-3 text-blue-300 font-black uppercase tracking-widest text-sm">
                        <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> {viewingProfile.course}</span>
                        <span>•</span>
                        <span>{viewingProfile.branch}</span>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-1 space-y-10">
                    <section>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Contact & Vital Stats</h4>
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 group">
                          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Email Address</p>
                            <p className="text-gray-900 font-bold text-base leading-tight mt-0.5">{viewingProfile.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Phone Number</p>
                            <p className="text-gray-900 font-bold text-base leading-tight mt-0.5">{viewingProfile.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group">
                          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl">
                            <BarChart2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Academic Performance</p>
                            <p className="text-gray-900 font-black text-xl leading-tight mt-0.5">{viewingProfile.cgpa} <span className="text-xs text-gray-400">CGPA</span></p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Core Competencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {viewingProfile.skills?.map((skill, i) => (
                          <span key={i} className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl text-xs font-bold border border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all cursor-default">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="lg:col-span-2 space-y-10">
                    <section>
                      <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Professional Summary</h4>
                      <div className="p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100/30 relative">
                        <div className="absolute top-6 left-6 text-blue-200">
                          <FileText className="w-8 h-8 opacity-20" />
                        </div>
                        <p className="text-gray-700 font-medium text-lg leading-relaxed italic relative z-10">
                          "{viewingProfile.description}"
                        </p>
                      </div>
                    </section>

                    <div className="flex flex-col sm:flex-row gap-5 pt-4">
                      <button className="flex-1 bg-[#3b82f6] text-white py-5 rounded-[1.25rem] font-black text-lg shadow-xl shadow-blue-500/20 hover:bg-[#2563eb] hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                        <FileText className="w-6 h-6" />
                        Download Portfolio
                      </button>
                      <button className="flex-1 px-8 py-5 bg-gray-100 text-gray-700 rounded-[1.25rem] font-black text-lg hover:bg-gray-200 transition-all active:scale-95">
                        Shortlist Candidate
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        );
      }

      const allApplicants = dashboardJobs.flatMap(job => 
        (job.applicantDetails || []).map(app => ({
          ...app,
          jobTitle: job.title
        }))
      );
      // Deduplicate by student_id
      const uniqueStudents = [];
      const seen = new Set();
      allApplicants.forEach(app => {
        if (!seen.has(app.student_id)) {
          seen.add(app.student_id);
          uniqueStudents.push(app);
        }
      });

      return (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Directory</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">Students who have applied to your job postings</p>
          </div>
          
          <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-8 py-5">Student Name</th>
                    <th className="px-8 py-5">Email</th>
                    <th className="px-8 py-5">Applied For</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {uniqueStudents.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-8 py-12 text-center text-gray-500 font-medium">
                        <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        No students have applied to your jobs yet.
                      </td>
                    </tr>
                  ) : (
                    uniqueStudents.map((student) => (
                      <tr key={student.student_id} className="hover:bg-gray-50/30 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {(student.student_name || 'S').split(' ').map(n => n[0]).join('')}
                            </div>
                            <p className="font-bold text-gray-900">{student.student_name}</p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-gray-600 font-medium">{student.student_email}</td>
                        <td className="px-8 py-5 text-gray-600 font-semibold">{student.jobTitle}</td>
                        <td className="px-8 py-5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                            student.status === 'Selected' ? 'bg-green-100 text-green-700' :
                            student.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            student.status === 'Shortlisted' ? 'bg-purple-100 text-purple-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {student.status || 'Applied'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }


    if (activeTab === "Announcements") {
      return (
        <div className="animate-in fade-in duration-300">
           <Announcements role="company" />
        </div>
      );
    }

    if (activeTab === "Competitions") {
      return (
        <div className="animate-in fade-in duration-300">
           <Competitions role="company" />
        </div>
      );
    }

    if (activeTab === "Events") {
      return (
        <div className="animate-in fade-in duration-300">
           <Events role="company" />
        </div>
      );
    }

    if (activeTab === "Settings") {
      const isDark = document.documentElement.classList.contains('dark');
      
      const handleThemeToggle = async () => {
        try {
          const newMode = !isDark;
          await updateProfile({ dark_mode: newMode });
          if (newMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          showNotification("Theme updated successfully", "success", "company");
        } catch (err) {
          showNotification("Failed to update theme", "error", "company");
        }
      };

      return (
        <div className="animate-in fade-in duration-300">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Account Settings</h2>
            <p className="text-gray-500 text-lg mt-2 font-medium">Manage your company profile and dashboard preferences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Settings className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Appearance</h3>
              </div>
              
              <div className="flex items-center justify-between p-6 bg-gray-50/50 rounded-2xl border border-gray-100 hover:bg-white hover:border-blue-200 transition-all group">
                <div>
                  <p className="text-sm font-bold text-gray-900">Dark Mode</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Enable a darker interface for low light</p>
                </div>
                <button 
                  onClick={handleThemeToggle}
                  className={`w-12 h-6 rounded-full transition-all relative ${isDark ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDark ? "left-7" : "left-1"}`} />
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <Mail className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Email Notifications</h3>
              </div>
              <p className="text-sm text-gray-500 font-medium italic">Advanced notification settings coming soon...</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "Help & Support") {
      return (
        <div className="animate-in fade-in duration-300 w-full pr-4">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Help & Support</h2>
            <p className="text-gray-500 text-sm mt-2 font-medium">If you need assistance regarding job postings, applications, or company profile management, you can contact support below.</p>
          </div>

          <div className="flex flex-col gap-8">
            {/* Support Information Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-5 group hover:shadow-xl transition-shadow">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Email Support</p>
                  <p className="text-gray-900 font-bold text-sm">support@rgukt.edu</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-5 group hover:shadow-xl transition-shadow">
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-gray-900 font-bold text-sm">+91 98765 43210</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center gap-5 group hover:shadow-xl transition-shadow">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Working Hours</p>
                  <p className="text-gray-900 font-bold text-sm">9 AM – 6 PM</p>
                  <p className="text-[10px] text-gray-400 font-medium italic">Monday to Saturday</p>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden w-full">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">FAQ Section</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {faqs.map((faq, index) => (
                  <div key={index} className="group">
                    <button 
                      onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-bold text-gray-800">{faq.q}</span>
                      {activeFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      )}
                    </button>
                    {activeFaq === index && (
                      <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-gray-600 text-sm font-medium leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
                          {faq.a}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Contact Support Form */}
            <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden w-full">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h3 className="text-xl font-black text-gray-900 tracking-tight">Contact Support Form</h3>
              </div>
              <form onSubmit={handleSupportSubmit} className="p-8 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 ml-1 uppercase tracking-widest">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={supportFormData.name}
                      onChange={handleSupportFormChange}
                      required
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-gray-900 placeholder-gray-300"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-400 ml-1 uppercase tracking-widest">Company Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={supportFormData.email}
                      onChange={handleSupportFormChange}
                      required
                      className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-gray-900 placeholder-gray-300"
                      placeholder="hr@company.com"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 ml-1 uppercase tracking-widest">Subject</label>
                  <input 
                    type="text" 
                    name="subject"
                    value={supportFormData.subject}
                    onChange={handleSupportFormChange}
                    required
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-gray-900 placeholder-gray-300"
                    placeholder="What do you need help with?"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-400 ml-1 uppercase tracking-widest">Message</label>
                  <textarea 
                    name="message"
                    value={supportFormData.message}
                    onChange={handleSupportFormChange}
                    required
                    rows={5}
                    className="w-full px-5 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none font-bold text-gray-900 placeholder-gray-300 resize-none"
                    placeholder="Detailed description of your request..."
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-[#3b82f6] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-[#2563eb] hover:shadow-2xl transition-all active:scale-95"
                >
                  Submit Support Request
                </button>
              </form>
            </section>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 mt-20 animate-in fade-in zoom-in duration-300">
        <div className="p-6 bg-white rounded-full shadow-sm border border-gray-100 mb-6">
          <LayoutDashboard className="w-16 h-16 text-gray-300" />
        </div>
        <h3 className="text-xl font-bold text-gray-700 mb-2">{activeTab}</h3>
        <p className="text-sm font-medium">This module is currently under development.</p>
      </div>
    );
  };

  return (
    <div className="h-screen flex font-sans bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-gray-50 to-white overflow-hidden">
      {/* Sidebar */}
      <CompanySidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-[72px] bg-white border-b border-gray-200 flex items-center justify-between px-8 z-20 shrink-0">
          <div className="flex-1 max-w-5xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#3b82f6] transition-colors" />
              <input 
                type="text" 
                placeholder="Search jobs, students, applications..." 
                className="w-full pl-11 pr-4 py-3 bg-gray-100/80 border-2 border-transparent rounded-full focus:ring-0 focus:border-blue-500/20 focus:bg-white outline-none transition-all text-sm font-medium placeholder-gray-400 hover:bg-gray-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2.5 text-gray-500 hover:bg-gray-100 hover:text-[#3b82f6] rounded-full transition-all group">
              <Bell className="w-6 h-6 group-hover:animate-swing origin-top" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-gray-200 pl-5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{companyProfile.name}</p>
                <p className="text-[11px] font-bold text-[#3b82f6] mt-1.5 uppercase tracking-wide">Company</p>
              </div>
              <button className="w-10 h-10 bg-gradient-to-tr from-[#052c42] to-blue-800 text-white rounded-full flex items-center justify-center font-bold shadow-md text-sm border-2 border-white ring-2 ring-gray-100 hover:ring-gray-200 transition-all">
                {companyProfile.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pt-5 px-8 pb-8 bg-gray-50/50 relative">
           <div className="max-w-[1400px] mx-auto h-full">
             {renderContent()}
           </div>
        </main>
      </div>

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-white/20">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-10 py-12 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-6">
                   <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-4xl font-black border border-white/20 shadow-inner">
                     {selectedStudent.studentName.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div>
                     <h3 className="text-4xl font-black tracking-tight">{selectedStudent.studentName}</h3>
                     <p className="text-blue-400 text-sm font-black uppercase tracking-widest mt-2">{selectedStudent.course} • {selectedStudent.branch}</p>
                     <div className="flex gap-3 mt-4">
                        <span className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider backdrop-blur-md border ${
                          selectedStudent.status === 'Accepted' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                          selectedStudent.status === 'Rejected' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {selectedStudent.status}
                        </span>
                        <span className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-white/5 text-white/60 border border-white/10 backdrop-blur-sm">
                          Applied: {selectedStudent.date}
                        </span>
                     </div>
                   </div>
                 </div>
                 <button 
                  onClick={() => setShowStudentModal(false)}
                  className="p-3 hover:bg-white/10 rounded-2xl transition-all active:scale-90"
                 >
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                 </button>
               </div>
            </div>
            
            <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10 max-h-[60vh] overflow-y-auto">
              <div className="lg:col-span-1 space-y-8">
                <section>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Contact Information</h4>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Email</p>
                        <p className="text-gray-900 font-bold text-sm">{selectedStudent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Phone</p>
                        <p className="text-gray-900 font-bold text-sm">{selectedStudent.phone}</p>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.skills?.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-gray-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <section>
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Candidate Overview</h4>
                  <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                    <p className="text-gray-700 font-medium leading-relaxed italic">
                      "{selectedStudent.description}"
                    </p>
                  </div>
                </section>

                <section>
                   <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Application Details</h4>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Position Applied</p>
                        <p className="text-gray-900 font-black text-lg mt-1">{selectedStudent.jobTitle}</p>
                      </div>
                      <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Candidate ID</p>
                        <p className="text-gray-900 font-black text-lg mt-1">#STU-{1000 + selectedStudent.id}</p>
                      </div>
                   </div>
                </section>

                <div className="flex gap-4 pt-4">
                  <button className="flex-1 bg-[#3b82f6] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-[#2563eb] hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
                    <FileText className="w-5 h-5" />
                    Download Resume
                  </button>
                  <button className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-95">
                    Contact HR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Job Posting Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-white/20">
            <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] px-8 py-8 text-white flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-20 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
              <div className="relative z-10">
                <h3 className="text-3xl font-black tracking-tight">{isEditing ? "Edit Job Posting" : "Post New Job"}</h3>
                <p className="text-blue-400 text-xs font-black uppercase tracking-widest mt-2">{isEditing ? "Modify existing opportunity" : "Create a new opportunity"}</p>
              </div>
              <button 
                onClick={closePostJobModal}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handlePostJob} className="p-8 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={postJobFormData.title}
                    onChange={handlePostJobChange}
                    placeholder="e.g. Senior Frontend Engineer"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium ${formErrors.title ? 'border-red-500' : 'border-transparent focus:border-[#3b82f6]'}`}
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.title}</p>}
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Department *</label>
                  <input
                    type="text"
                    name="department"
                    value={postJobFormData.department}
                    onChange={handlePostJobChange}
                    placeholder="e.g. Engineering"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium ${formErrors.department ? 'border-red-500' : 'border-transparent focus:border-[#3b82f6]'}`}
                  />
                  {formErrors.department && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.department}</p>}
                </div>

                {/* Job Location */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={postJobFormData.location}
                    onChange={handlePostJobChange}
                    placeholder="e.g. Remote / New York, NY"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium ${formErrors.location ? 'border-red-500' : 'border-transparent focus:border-[#3b82f6]'}`}
                  />
                  {formErrors.location && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.location}</p>}
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Type *</label>
                  <select
                    name="type"
                    value={postJobFormData.type}
                    onChange={handlePostJobChange}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium appearance-none ${formErrors.type ? 'border-red-500' : 'border-transparent focus:border-[#346b41]'}`}
                  >
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                  {formErrors.type && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.type}</p>}
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Salary Range *</label>
                  <input
                    type="text"
                    name="salary"
                    value={postJobFormData.salary}
                    onChange={handlePostJobChange}
                    placeholder="e.g. $80k - $120k"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium ${formErrors.salary ? 'border-red-500' : 'border-transparent focus:border-[#346b41]'}`}
                  />
                  {formErrors.salary && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.salary}</p>}
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Application Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={postJobFormData.deadline}
                    onChange={handlePostJobChange}
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium ${formErrors.deadline ? 'border-red-500' : 'border-transparent focus:border-[#346b41]'}`}
                  />
                  {formErrors.deadline && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.deadline}</p>}
                </div>

                {/* Experience Required */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Experience Required *</label>
                  <input
                    type="text"
                    name="experience"
                    value={postJobFormData.experience}
                    onChange={handlePostJobChange}
                    placeholder="e.g. 3+ years"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium ${formErrors.experience ? 'border-red-500' : 'border-transparent focus:border-[#346b41]'}`}
                  />
                  {formErrors.experience && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.experience}</p>}
                </div>

                {/* Minimum CGPA Required */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Minimum CGPA Required *</label>
                  <input
                    type="text"
                    name="min_cgpa"
                    value={postJobFormData.min_cgpa}
                    onChange={handlePostJobChange}
                    placeholder="e.g. 7.5"
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium ${formErrors.min_cgpa ? 'border-red-500' : 'border-transparent focus:border-[#3b82f6]'}`}
                  />
                  {formErrors.min_cgpa && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.min_cgpa}</p>}
                </div>

                {/* Job Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Description *</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={postJobFormData.description}
                    onChange={handlePostJobChange}
                    placeholder="Describe the role and responsibilities..."
                    className={`w-full px-4 py-3 bg-gray-50 border-2 rounded-xl focus:bg-white outline-none transition-all font-medium resize-none ${formErrors.description ? 'border-red-500' : 'border-transparent focus:border-[#346b41]'}`}
                  ></textarea>
                  {formErrors.description && <p className="text-red-500 text-xs mt-1 font-bold">{formErrors.description}</p>}
                </div>

                {/* Required Skills */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Required Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={postJobFormData.skills}
                    onChange={handlePostJobChange}
                    placeholder="e.g. React, Tailwind, Node.js"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#346b41] focus:bg-white outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-row gap-4 mt-10">
                <button
                  type="button"
                  onClick={closePostJobModal}
                  className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-black text-lg transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  {isEditing ? "Update Job" : "Post Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rounds Manager Modal */}
      {showRoundsModal && selectedAppForRounds && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900 leading-tight">
                  Manage Interview Rounds
                </h2>
                <p className="text-sm font-medium text-gray-500 mt-1">
                  {selectedAppForRounds.student_name} • {selectedAppForRounds.jobTitle}
                </p>
              </div>
              <button 
                onClick={() => { setShowRoundsModal(false); setSelectedAppForRounds(null); }}
                className="p-2 rounded-xl hover:bg-gray-200/50 text-gray-400 hover:text-gray-900 transition-all font-bold"
              >
                Close
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 bg-gray-50">
              {/* Existing Rounds */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-extrabold text-[#052c42] uppercase tracking-[0.1em] mb-4">Application History</h3>
                {loadingRounds ? (
                  <p className="text-sm text-gray-500 italic">Loading rounds...</p>
                ) : appRounds.length === 0 ? (
                  <p className="text-sm text-gray-400 font-medium p-4 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-300">No rounds created yet.</p>
                ) : (
                  <div className="space-y-4">
                    {appRounds.map((round, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-100 rounded-2xl bg-gray-50 gap-4">
                        <div>
                          <h4 className="font-bold text-gray-900">{round.round_name}</h4>
                          <p className="text-xs text-gray-500 font-medium flex gap-3 mt-1">
                            <span>{new Date(round.date).toLocaleDateString()} at {round.time}</span>
                            <span>|</span>
                            <span>{round.location}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-1 rounded-md ${
                            round.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-700' :
                            round.status === 'Passed' ? 'bg-green-100 text-green-700' :
                            round.status === 'Failed' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {round.status}
                          </span>
                          <select
                            value={round.status}
                            onChange={(e) => handleRoundStatusUpdate(round.id, e.target.value)}
                            className="border-2 border-gray-200 rounded-xl py-1.5 px-3 text-xs font-bold bg-white outline-none focus:border-blue-500 transition-colors cursor-pointer"
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Completed">Completed</option>
                            <option value="Passed">Passed</option>
                            <option value="Failed">Failed</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Create Round Form */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-extrabold text-[#052c42] uppercase tracking-[0.1em] mb-4">+ Schedule New Round</h3>
                <form onSubmit={handleCreateRound} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Round Name / Title *</label>
                    <input type="text" value={newRoundForm.round_name} onChange={e => setNewRoundForm({...newRoundForm, round_name: e.target.value})} required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-sm" placeholder="e.g. Technical Interview L1" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Date *</label>
                    <input type="date" value={newRoundForm.date} onChange={e => setNewRoundForm({...newRoundForm, date: e.target.value})} required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Time *</label>
                    <input type="time" value={newRoundForm.time} onChange={e => setNewRoundForm({...newRoundForm, time: e.target.value})} required className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">Interview Link / Location</label>
                    <input type="text" value={newRoundForm.location} onChange={e => setNewRoundForm({...newRoundForm, location: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-blue-500 transition-all font-medium text-sm" placeholder="Zoom Link, Google Meet, or Office Address" />
                  </div>
                  <div className="md:col-span-2 pt-2">
                    <button type="submit" disabled={isSubmitting} className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center">
                      {isSubmitting ? 'Creating...' : '+ Create Round'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}