import React, { useEffect, useState } from "react";
import { getPostedJobs, postJob, updateApplicationStatus } from "../services/companyService";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  BarChart2, 
  Settings, 
  HelpCircle, 
  Search, 
  Bell,
  LogOut,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Clock,
  ArrowLeft,
  GraduationCap
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("Home");
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({ title: "", min_cgpa: "", ctc: "" });
  const [message, setMessage] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  const [postJobFormData, setPostJobFormData] = useState({
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    salary: "",
    deadline: "",
    description: "",
    skills: "",
    experience: ""
  });

  // New Dashboard Stats and Table State
  const [dashboardStats, setDashboardStats] = useState({
    totalJobs: 24,
    applications: 186,
    studentsReached: 1420,
    placementRate: "68%"
  });

  const [dashboardJobs, setDashboardJobs] = useState([
    { id: 1, title: "Frontend Developer", department: "Engineering", deadline: "2024-10-15", applications: 45, status: "Active" },
    { id: 2, title: "UX Designer", department: "Design", deadline: "2024-10-20", applications: 28, status: "Active" },
    { id: 3, title: "Data Analyst", department: "Data Science", deadline: "2024-09-30", applications: 82, status: "Closed" },
    { id: 4, title: "Product Manager", department: "Product", deadline: "2024-11-05", applications: 19, status: "In Review" },
    { id: 5, title: "Backend Engineer", department: "Engineering", deadline: "2024-11-12", applications: 12, status: "Active" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // New Analytics State Data
  const [trendData, setTrendData] = useState([
    { month: 'Jan', applications: 45 },
    { month: 'Feb', applications: 72 },
    { month: 'Mar', applications: 95 },
    { month: 'Apr', applications: 130 },
    { month: 'May', applications: 85 },
    { month: 'Jun', applications: 110 },
  ]);

  const [placementData, setPlacementData] = useState([
    { name: 'Placed', value: 45 },
    { name: 'In Process', value: 30 },
    { name: 'Pending', value: 25 },
  ]);

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
    alert("Support request submitted! We will get back to you soon.");
    setSupportFormData({ name: '', email: '', subject: '', message: '' });
  };

  // Sample Data for populated states
  const sampleStudents = [
    { 
      id: 1, 
      name: "Arjun Mehta", 
      email: "arjun.m@university.edu", 
      phone: "+91 98765 00001",
      course: "Computer Science", 
      branch: "Engineering",
      status: "Open for Work", 
      cgpa: "9.2",
      skills: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
      description: "Highly motivated frontend developer with a strong foundation in MERN stack. Passionate about building scalable web applications and intuitive user interfaces."
    },
    { 
      id: 2, 
      name: "Priya Sharma", 
      email: "priya.s@tech.edu", 
      phone: "+91 98765 00002",
      course: "Information Technology", 
      branch: "Design",
      status: "Interning", 
      cgpa: "8.8",
      skills: ["Figma", "User Research", "Adobe XD", "CSS3"],
      description: "Creative UI/UX designer with a keen eye for detail. Experienced in creating wireframes, prototypes, and conducting user usability testing."
    },
    { 
      id: 3, 
      name: "Rahul Verma", 
      email: "rahul.v@poly.edu", 
      phone: "+91 98765 00003",
      course: "Software Engineering", 
      branch: "Systems Engineering",
      status: "Open for Work", 
      cgpa: "8.5",
      skills: ["Java", "Python", "Docker", "Kubernetes"],
      description: "Systems-focused developer with experience in cloud-native technologies and backend architecture. Quick learner and problem solver."
    },
    { 
      id: 4, 
      name: "Ananya Iyer", 
      email: "ananya.i@science.edu", 
      phone: "+91 98765 00004",
      course: "Data Science", 
      branch: "Analytics",
      status: "Placed", 
      cgpa: "9.5",
      skills: ["Python", "SQL", "Tableau", "Machine Learning"],
      description: "Aspiring data scientist with a background in statistical modeling and data visualization. Proven track record in analytical thinking."
    },
    { 
      id: 5, 
      name: "Siddharth Malhotra", 
      email: "sid.m@uni.edu", 
      phone: "+91 98765 00005",
      course: "AI & ML", 
      branch: "Computer Science",
      status: "Open for Work", 
      cgpa: "9.0",
      skills: ["PyTorch", "TensorFlow", "OpenCV", "C++"],
      description: "AI enthusiast specializing in computer vision and deep learning. Dedicated to building intelligent systems that solve real-world problems."
    }
  ];

  const sampleApplications = [
    { 
      id: 1, 
      studentName: "Arjun Mehta", 
      jobTitle: "Frontend Developer", 
      date: "2024-03-10", 
      status: "Reviewed",
      email: "arjun.m@university.edu",
      phone: "+91 98765 00001",
      course: "Computer Science",
      branch: "Engineering",
      skills: ["React", "JavaScript", "Tailwind CSS"],
      description: "Highly motivated frontend developer with a passion for building beautiful and performant user interfaces."
    },
    { 
      id: 2, 
      studentName: "Priya Sharma", 
      jobTitle: "UX Designer", 
      date: "2024-03-12", 
      status: "Accepted",
      email: "priya.s@tech.edu",
      phone: "+91 98765 00002",
      course: "Information Technology",
      branch: "Design",
      skills: ["Figma", "User Research", "Prototyping"],
      description: "Creative UX designer focused on creating intuitive and user-centered digital experiences."
    },
    { 
      id: 3, 
      studentName: "Vikram Singh", 
      jobTitle: "Full Stack Dev", 
      date: "2024-03-14", 
      status: "Pending",
      email: "vikram.s@poly.edu",
      phone: "+91 98765 00003",
      course: "Software Engineering",
      branch: "Engineering",
      skills: ["Node.js", "Express", "MongoDB"],
      description: "Versatile full stack developer with experience in building scalable web applications."
    },
    { 
      id: 4, 
      studentName: "Sneha Kapur", 
      jobTitle: "Data Analyst", 
      date: "2024-03-15", 
      status: "Reviewed",
      email: "sneha.k@science.edu",
      phone: "+91 98765 00004",
      course: "Data Science",
      branch: "Analytics",
      skills: ["Python", "SQL", "Tableau"],
      description: "Data enthusiast with strong analytical skills and a background in statistical modeling."
    }
  ];

  const companyProfile = {
    name: "TechNova Inc.",
    email: "hr@technova.com",
    location: "Bangalore, India",
    contact: "+91 98765 43210",
    description: "Innovating the future through cutting-edge software solutions and Al-driven recruitment platforms.",
    industry: "Information Technology",
    employees: "500-1000"
  };

  const COLORS = ['#3b82f6', '#818cf8', '#f59e0b']; // Blue, Indigo, Amber

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const data = await getPostedJobs();
        setJobs(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchJobs();
  }, []);

  const handlePostJob = async (e) => {
    e.preventDefault();
    // Validation
    if (!postJobFormData.title || !postJobFormData.department || !postJobFormData.deadline) {
      alert("Please fill in the required fields (Title, Department, Deadline)");
      return;
    }

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
      setMessage("Job updated successfully!");
    } else {
      // Create Mode
      const newJobObj = {
        id: dashboardJobs.length + 1,
        title: postJobFormData.title,
        department: postJobFormData.department,
        deadline: postJobFormData.deadline,
        applications: 0,
        status: "Active",
        location: postJobFormData.location,
        type: postJobFormData.type,
        salary: postJobFormData.salary,
        description: postJobFormData.description,
        skills: postJobFormData.skills,
        experience: postJobFormData.experience
      };

      setDashboardJobs([newJobObj, ...dashboardJobs]);
      setDashboardStats({
        ...dashboardStats,
        totalJobs: dashboardStats.totalJobs + 1
      });
      setMessage("Job posted successfully!");
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
      experience: ""
    });
    setIsEditing(false);
    setEditJobId(null);
    setShowPostJobModal(false);
  };

  const handleEditClick = (job) => {
    setPostJobFormData({
      title: job.title || "",
      department: job.department || "",
      location: job.location || "",
      type: job.type || "Full-time",
      salary: job.salary || "",
      deadline: job.deadline || "",
      description: job.description || "",
      skills: job.skills || "",
      experience: job.experience || ""
    });
    setIsEditing(true);
    setEditJobId(job.id);
    setShowPostJobModal(true);
  };

  const handlePostJobChange = (e) => {
    const { name, value } = e.target;
    setPostJobFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusUpdate = async (jobId, studentId, status) => {
    try {
      await updateApplicationStatus(jobId, studentId, status);
      setMessage("Status updated successfully!");
    } catch (err) {
      setMessage("Error updating status");
    }
  };

  const handleLogout = () => {
    // Redirect to home/login
    window.location.href = "/";
  };

  const sidebarItems = [
    { name: "Home", icon: LayoutDashboard },
    { name: "Posted Jobs", icon: Briefcase },
    { name: "Applications", icon: FileText },
    { name: "Students", icon: Users },
    { name: "Analytics", icon: BarChart2 },
    { name: "Settings", icon: Settings },
    { name: "Help & Support", icon: HelpCircle },
  ];

  const renderContent = () => {
    const filteredJobs = dashboardJobs.filter(job => {
      const matchSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "All" || job.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (activeTab === "Home") {
      // Calculate dynamic stats from dashboardStats state
      const totalJobs = dashboardStats.totalJobs;
      const totalApplications = dashboardStats.applications;
      const studentsReached = dashboardStats.studentsReached;
      const placementRate = dashboardStats.placementRate;

      return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-10">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Welcome back, TechNova!</h2>
            <p className="text-gray-500 text-lg mt-2 font-medium">Here's what's happening with your recruitment today.</p>
          </div>
          
          {/* Dashboard Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {[
              { label: "Total Jobs", value: totalJobs, icon: Briefcase, color: "blue", trend: "+12% this month" },
              { label: "Applications", value: totalApplications, icon: FileText, color: "indigo", trend: "+24 new today" },
              { label: "Students Reached", value: studentsReached, icon: Users, color: "purple", trend: "Top 5% reach" },
              { label: "Placement Rate", value: placementRate, icon: BarChart2, color: "blue", trend: "Industry leading" }
            ].map((stat, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col gap-6 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] transition-all duration-500 cursor-pointer group relative overflow-hidden">
                <div className={`absolute top-0 right-0 p-12 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-${stat.color}-500/10 transition-colors`}></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl group-hover:bg-${stat.color}-600 group-hover:text-white shadow-sm transition-all duration-500`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-${stat.color}-50 text-${stat.color}-700 rounded-full border border-${stat.color}-100`}>
                    {stat.trend}
                  </span>
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
      return (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Manage Applications</h2>
            <p className="text-gray-500 text-sm mt-1">Review and update student application statuses</p>
          </div>
          
          {jobs.length === 0 ? (
             <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
               <div className="p-8 border-b border-gray-100 bg-gray-50/30">
                 <h3 className="text-xl font-black text-gray-900 tracking-tight">Recent Applications</h3>
                 <p className="text-sm text-gray-500 font-medium mt-1">Showing sample data for demonstration</p>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                       <th className="px-8 py-5">Student Name</th>
                       <th className="px-8 py-5">Job Title</th>
                       <th className="px-8 py-5 text-center">Applied Date</th>
                       <th className="px-8 py-5">Status</th>
                       <th className="px-8 py-5 text-right">Action</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                     {sampleApplications.map((app) => (
                       <tr key={app.id} className="hover:bg-gray-50/30 transition-colors group">
                         <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                               {app.studentName.split(' ').map(n => n[0]).join('')}
                             </div>
                             <p className="font-bold text-gray-900">{app.studentName}</p>
                           </div>
                         </td>
                         <td className="px-8 py-5 text-gray-600 font-semibold">{app.jobTitle}</td>
                         <td className="px-8 py-5 text-center font-bold text-gray-500">{app.date}</td>
                         <td className="px-8 py-5">
                           <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                             app.status === 'Accepted' ? 'bg-green-100 text-green-700' :
                             app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                             app.status === 'Reviewed' ? 'bg-purple-100 text-purple-700' :
                             'bg-blue-100 text-blue-700'
                           }`}>
                             {app.status}
                           </span>
                         </td>
                         <td className="px-8 py-5 text-right">
                           <button 
                             onClick={() => {
                               setSelectedStudent(app);
                               setShowStudentModal(true);
                             }}
                             className="text-blue-600 hover:text-blue-700 font-black text-sm uppercase tracking-wider"
                           >
                             View Details
                           </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </section>
          ) : (
            <div className="grid gap-8">
              {jobs.map((job) => (
                <div key={`app-${job.id}`} className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                  <div className="bg-gradient-to-r from-gray-50/50 to-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="font-black text-xl text-gray-900 tracking-tight">{job.title}</h3>
                      <p className="text-xs text-blue-600 mt-1.5 font-black uppercase tracking-widest">Showing {job.applications?.length || 0} applicant(s)</p>
                    </div>
                    <div className="text-xs font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      ID: #{job.id}
                    </div>
                  </div>
                  <div className="p-0">
                    {(!job.applications || job.applications.length === 0) ? (
                      <div className="p-12 text-center bg-gray-50/30">
                        <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No applicants for this role yet</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold bg-gray-50/50">
                              <th className="px-8 py-5">Student Name</th>
                              <th className="px-8 py-5">Status</th>
                              <th className="px-8 py-5 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {job.applications.map((app) => (
                              <tr key={app.student_id} className="hover:bg-gray-50/30 transition-colors group">
                                <td className="px-8 py-5 font-bold text-gray-900">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                      {app.student_name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    {app.student_name}
                                  </div>
                                </td>
                                <td className="px-8 py-5">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                                    app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    app.status === 'Shortlisted' ? 'bg-purple-100 text-purple-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                                      app.status === 'Selected' ? 'bg-green-500' :
                                      app.status === 'Rejected' ? 'bg-red-500' :
                                      app.status === 'Shortlisted' ? 'bg-purple-500' :
                                      'bg-blue-500'
                                    }`}></span>
                                    {app.status || 'Applied'}
                                  </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                  <select
                                    value={app.status || 'Applied'}
                                    onChange={(e) => handleStatusUpdate(job.id, app.student_id, e.target.value)}
                                    className="border-2 border-gray-100 rounded-xl py-2 pl-4 pr-10 text-xs font-bold bg-white focus:border-blue-500/50 outline-none shadow-sm cursor-pointer transition-all hover:bg-gray-50"
                                  >
                                    <option value="Applied">Applied</option>
                                    <option value="Shortlisted">Shortlisted</option>
                                    <option value="Selected">Selected</option>
                                    <option value="Rejected">Rejected</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
          
          {/* Detailed Analytics Call to Action - Optional placeholder */}
          <div className="bg-gradient-to-r from-[#1e293b] to-[#0f172a] rounded-3xl p-10 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 border border-white/5 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-20 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-blue-500/20 transition-colors duration-700"></div>
             <div className="relative z-10">
               <h3 className="text-2xl font-black mb-3 tracking-tight">Want deeper insights?</h3>
               <p className="text-white/70 font-medium text-base md:max-w-md leading-relaxed">Upgrade to Eduvate Employer Pro to unlock advanced candidate tracking, custom reports, and predictive hiring analytics.</p>
             </div>
             <button className="relative z-10 bg-[#3b82f6] text-white px-10 py-5 rounded-2xl font-black text-base shadow-xl shadow-blue-500/30 hover:bg-[#2563eb] hover:shadow-2xl transition-all active:scale-95 whitespace-nowrap">
               Upgrade to Pro
             </button>
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

      return (
        <div className="animate-in fade-in duration-300">
          <div className="mb-6">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Directory</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">Browse and connect with potential candidates</p>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search students by name or course..."
                className="pl-11 pr-5 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-sm outline-none w-full transition-all"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <select className="px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 outline-none hover:border-gray-300 transition-all cursor-pointer">
                <option>All Courses</option>
                <option>Computer Science</option>
                <option>Data Science</option>
                <option>Design</option>
              </select>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all text-sm font-bold shadow-lg shadow-blue-500/20 active:scale-95">
                Filter
              </button>
            </div>
          </div>

          <section className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                    <th className="px-8 py-5">Student Name</th>
                    <th className="px-8 py-5">Course / Branch</th>
                    <th className="px-8 py-5 text-center">CGPA</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sampleStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-400 font-medium">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-gray-600 font-semibold">{student.course}</td>
                      <td className="px-8 py-5 text-center font-bold text-gray-900">{student.cgpa}</td>
                      <td className="px-8 py-5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold ${
                          student.status === 'Open for Work' ? 'bg-green-100 text-green-700' :
                          student.status === 'Placed' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button 
                          onClick={() => setViewingProfile(student)}
                          className="text-blue-600 hover:text-blue-700 font-black text-sm uppercase tracking-wider"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === "Settings") {
      return (
        <div className="animate-in fade-in duration-300 w-full pr-4">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Organization Settings</h2>
            <p className="text-gray-500 text-sm mt-1 font-medium">Manage your company profile and account preferences</p>
          </div>

          <div className="space-y-8">
            {/* Company Profile Card */}
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-[#0f172a] to-[#1e293b] p-8 text-white relative h-32">
                <div className="absolute -bottom-10 left-8">
                  <div className="w-24 h-24 bg-white rounded-3xl shadow-2xl p-2 flex items-center justify-center border-4 border-gray-50">
                    <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black">
                      TN
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-16 p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">{companyProfile.name}</h3>
                    <p className="text-blue-600 font-bold text-sm tracking-wide uppercase mt-1">{companyProfile.industry} • {companyProfile.employees} Employees</p>
                  </div>
                  <button className="bg-white text-black px-6 py-3 rounded-xl font-bold text-sm border-2 border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm active:scale-95">
                    Edit Company Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100 pt-8">
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-gray-900 font-bold text-lg">{companyProfile.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-gray-900 font-bold text-lg">{companyProfile.contact}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Headquarters</p>
                    <p className="text-gray-900 font-bold text-lg">{companyProfile.location}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Platform Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <p className="text-green-700 font-bold text-sm">Verified Employer Account</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">About the Company</p>
                  <p className="text-gray-600 font-medium leading-relaxed">{companyProfile.description}</p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
              <h3 className="text-xl font-black text-gray-900 mb-6">Security & Preferences</h3>
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Push Notifications</p>
                      <p className="text-[11px] text-gray-500 font-medium">Control dashboard alerts and updates</p>
                    </div>
                  </div>
                  <div className="w-12 h-6 bg-blue-600/20 rounded-full relative">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-blue-600 rounded-full"></div>
                  </div>
                </button>
                <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Change Password</p>
                      <p className="text-[11px] text-gray-500 font-medium">Last updated 3 months ago</p>
                    </div>
                  </div>
                  <span className="text-gray-400">&rarr;</span>
                </button>
              </div>
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
      <aside className="w-80 bg-gradient-to-b from-[#0f172a] to-[#1e293b] flex flex-col py-6 z-10 shrink-0 shadow-xl relative">
        {/* Eduvate Branding - Moved to Sidebar */}
        <div className="px-8 pb-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-tr from-[#3b82f6] to-[#60a5fa] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 transform -rotate-3 hover:rotate-0 transition-transform duration-300 ring-2 ring-white/10">
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.989-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white leading-none tracking-tight">EDUVATE</h1>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1.5">Company Portal</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            const isSupportItem = item.name === "Help & Support";
            
            return (
              <React.Fragment key={item.name}>
                {isSupportItem && (
                  <div className="px-4 mt-14 mb-2">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest opacity-70">Support</p>
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-all duration-200 group ${
                    isActive 
                      ? "bg-[#3b82f6] text-white shadow-lg shadow-blue-500/20 font-bold" 
                      : "text-gray-400 hover:bg-white/10 hover:text-white font-medium"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`} />
                  {item.name}
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
        
        <div className="px-4 mt-6 pt-6 border-t border-white/10 space-y-1.5">
          <button 
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-300" />
            Logout
          </button>
        </div>
      </aside>

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
                <p className="text-sm font-bold text-gray-900 leading-none">TechNova Inc.</p>
                <p className="text-[11px] font-bold text-[#3b82f6] mt-1.5 uppercase tracking-wide">Admin</p>
              </div>
              <button className="w-10 h-10 bg-gradient-to-tr from-[#052c42] to-blue-800 text-white rounded-full flex items-center justify-center font-bold shadow-md text-sm border-2 border-white ring-2 ring-gray-100 hover:ring-gray-200 transition-all">
                TN
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

      {/* Student Details Modal */}
      {showStudentModal && selectedStudent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 border border-white/20">
            <div className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-9 py-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
               <div className="flex justify-between items-start relative z-10">
                 <div className="flex items-center gap-5">
                   <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/20 shadow-inner">
                     {selectedStudent.studentName.split(' ').map(n => n[0]).join('')}
                   </div>
                   <div>
                     <h3 className="text-3xl font-black tracking-tight">{selectedStudent.studentName}</h3>
                     <p className="text-blue-400 text-sm font-black uppercase tracking-widest mt-1">{selectedStudent.course} • {selectedStudent.branch}</p>
                     <div className="flex gap-3 mt-3">
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

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-8 animate-in fade-in zoom-in duration-200 border border-white/20">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-4 bg-red-50 rounded-2xl mb-4 text-red-600">
                <LogOut className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">Sign Out</h3>
            </div>
            <p className="text-gray-600 text-sm text-center mb-8 font-medium leading-relaxed">
              Are you sure you want to log out? You will need to sign back in to manage your job postings and applications.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLogout}
                className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-red-600/20"
              >
                Yes, Sign Out
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
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
                    required
                    value={postJobFormData.title}
                    onChange={handlePostJobChange}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#3b82f6] focus:bg-white outline-none transition-all font-medium"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Department *</label>
                  <input
                    type="text"
                    name="department"
                    required
                    value={postJobFormData.department}
                    onChange={handlePostJobChange}
                    placeholder="e.g. Engineering"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#3b82f6] focus:bg-white outline-none transition-all font-medium"
                  />
                </div>

                {/* Job Location */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Location</label>
                  <input
                    type="text"
                    name="location"
                    value={postJobFormData.location}
                    onChange={handlePostJobChange}
                    placeholder="e.g. Remote / New York, NY"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#3b82f6] focus:bg-white outline-none transition-all font-medium"
                  />
                </div>

                {/* Job Type */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Type</label>
                  <select
                    name="type"
                    value={postJobFormData.type}
                    onChange={handlePostJobChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#346b41] focus:bg-white outline-none transition-all font-medium appearance-none"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                {/* Salary Range */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Salary Range</label>
                  <input
                    type="text"
                    name="salary"
                    value={postJobFormData.salary}
                    onChange={handlePostJobChange}
                    placeholder="e.g. $80k - $120k"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#346b41] focus:bg-white outline-none transition-all font-medium"
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Application Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    value={postJobFormData.deadline}
                    onChange={handlePostJobChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#346b41] focus:bg-white outline-none transition-all font-medium"
                  />
                </div>

                {/* Experience Required */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Experience Required</label>
                  <input
                    type="text"
                    name="experience"
                    value={postJobFormData.experience}
                    onChange={handlePostJobChange}
                    placeholder="e.g. 3+ years"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#346b41] focus:bg-white outline-none transition-all font-medium"
                  />
                </div>

                {/* Job Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Job Description</label>
                  <textarea
                    name="description"
                    rows="4"
                    value={postJobFormData.description}
                    onChange={handlePostJobChange}
                    placeholder="Describe the role and responsibilities..."
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-[#346b41] focus:bg-white outline-none transition-all font-medium resize-none"
                  ></textarea>
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
    </div>
  );
}