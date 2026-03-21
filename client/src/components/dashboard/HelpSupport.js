import React, { useState, useEffect } from "react";
import { reportIssue } from "../../services/adminService";
import socketService from "../../services/socketService";
import { useNotification } from "../../context/NotificationContext";
import {
  Search,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Upload,
  Mail,
  Phone,
  Clock,
  Send,
  ExternalLink
} from "lucide-react";

export default function HelpSupport({ role }) {
  const { showNotification } = useNotification();
  const [openFaq, setOpenFaq] = useState(null);
  const [reportForm, setReportForm] = useState({
    title: "",
    category: "Bug",
    description: "",
  });

  useEffect(() => {
    socketService.on("ticketReply", (data) => {
        showNotification(`Support Ticket Update: ${data.message}`, "info", "student");
    });

    return () => {
        socketService.off("ticketReply");
    };
  }, [showNotification]);

  const studentFaqs = [
    {
      q: "How do I apply for a job?",
      a: "Go to 'Browse Jobs', click on any job card to see details, and click 'Apply Now'. Your profile will be shared with the recruiter automatically."
    },
    {
      q: "Can I update my profile after applying?",
      a: "Yes, you can update your profile anytime in the 'My Profile' section. However, recruiters see the version of your profile at the time they review your application."
    },
    {
      q: "How can I track my application status?",
      a: "Visit 'Applied Jobs' to see a real-time progress bar for each application, including steps like Shortlisted, Interview Scheduled, and Selected."
    },
    {
      q: "What if I miss an interview?",
      a: "Contact the placement cell immediately via the 'Report Issue' form. Mention the company and reason for absence for rescheduling requests."
    }
  ];

  const adminFaqs = [
    {
      q: "How do I approve a new student or company?",
      a: "Go to 'User Approvals' from the sidebar. You will see a list of pending requests. Click 'Approve' to activate their account or 'Reject' to deny access."
    },
    {
      q: "How can I export student data to Excel/CSV?",
      a: "Navigate to 'Student Management' and click the 'Export CSV' button at the top right. This will download a file containing all student details and placement statistics."
    },
    {
      q: "Can I edit an existing announcement?",
      a: "Currently, you can delete an announcement and post a new one. Direct editing is coming in a future update."
    },
    {
      q: "How is the placement percentage calculated?",
      a: "The dashboard calculates this as (Number of Students with 'Placed' status / Total Number of Active Students) * 100."
    }
  ];

  const faqs = role === 'admin' ? adminFaqs : studentFaqs;

  const quickHelp = [
    { title: role === 'admin' ? "Admin Guide" : "User Guide", desc: role === 'admin' ? "System configuration manual" : "Detailed manual for students", icon: BookOpen, color: "blue" },
    { title: "FAQs", desc: "Quick answers to common questions", icon: HelpCircle, color: "purple" },
    { title: "Report an Issue", desc: "Flag bugs or technical glitches", icon: AlertTriangle, color: "orange" },
    { title: "Contact Support", desc: "Get direct help from our team", icon: MessageSquare, color: "green" },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const [submitState, setSubmitState] = useState({ loading: false, success: false, error: null });

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setSubmitState({ loading: true, success: false, error: null });
    
    const payload = {
      title: reportForm.title,
      category: reportForm.category,
      description: reportForm.description,
      priority: "Normal"
    };

    try {
      const res = await reportIssue(payload);
      if (res.success) {
        setSubmitState({ loading: false, success: true, error: null });
        setReportForm({ title: "", category: "Bug", description: "" });
        setTimeout(() => setSubmitState(s => ({...s, success: false})), 3000);
      } else {
        setSubmitState({ loading: false, success: false, error: res.message });
      }
    } catch (err) {
      setSubmitState({ loading: false, success: false, error: "Failed to submit report" });
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Help & Support</h2>
          <p className="text-gray-500 font-medium mt-1">Find answers, report issues, or contact the support team.</p>
        </div>
        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-green-600 transition-colors">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input 
            type="text" 
            placeholder="Search help articles..." 
            className="w-full pl-11 pr-4 py-3 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-green-500 transition-all font-bold text-gray-700 shadow-sm"
          />
        </div>
      </div>

      {/* Quick Help Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickHelp.map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
            <div className={`p-4 bg-${item.color}-50 text-${item.color}-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform`}>
              <item.icon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* FAQ Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 italic underline decoration-green-400 decoration-4 underline-offset-8">Common Questions</h3>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-bold text-gray-800">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-green-600" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-gray-600 leading-relaxed font-medium pt-2 border-t border-gray-50">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Contact Support Section */}
          <div className="bg-green-900 rounded-[2.5rem] p-10 mt-10 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
            <h3 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3">
              <MessageSquare className="w-8 h-8" /> Contact Support
            </h3>
            <div className="space-y-6 relative z-10">
              <div className="flex items-center gap-5 group cursor-pointer">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/20 group-hover:bg-white group-hover:text-green-900 transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300">Support Email</p>
                  <p className="text-lg font-bold">support@eduvate.com</p>
                </div>
              </div>

              <div className="flex items-center gap-5 group cursor-pointer">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/20 group-hover:bg-white group-hover:text-green-900 transition-all">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300">Phone Support</p>
                  <p className="text-lg font-bold">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-5">
                <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-green-300">Office Hours</p>
                  <p className="text-lg font-bold">Mon–Fri, 9AM – 6PM</p>
                </div>
              </div>
            </div>
            
            <button className="w-full mt-10 py-4 bg-white text-green-900 font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-green-50 transition-all active:scale-95 shadow-xl">
              <ExternalLink className="w-5 h-5" /> Open Support Portal
            </button>
          </div>
        </div>

        {/* Report Issue Form */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Report an Issue</h3>
          </div>

          <form className="space-y-6" onSubmit={handleReportSubmit}>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Issue Title</label>
              <input 
                required
                type="text" 
                placeholder="E.g., CSV upload not working"
                value={reportForm.title}
                onChange={e => setReportForm({...reportForm, title: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-700" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Issue Category</label>
              <div className="relative">
                <select 
                  value={reportForm.category}
                  onChange={e => setReportForm({...reportForm, category: e.target.value})}
                  className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-orange-500 appearance-none font-bold text-gray-700 cursor-pointer">
                  <option>Bug</option>
                  <option>Login Issue</option>
                  <option>Data Issue</option>
                  <option>Other</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                required
                rows="4"
                placeholder="Please describe the issue in detail..."
                value={reportForm.description}
                onChange={e => setReportForm({...reportForm, description: e.target.value})}
                className="w-full px-5 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-gray-700 resize-none"
              ></textarea>
            </div>

            <button disabled={submitState.loading} type="submit" className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-orange-700 transition-all shadow-xl shadow-orange-600/20 active:scale-95 disabled:opacity-50">
              <Send className="w-5 h-5" /> {submitState.loading ? "Submitting..." : "Submit Report"}
            </button>
            
            {submitState.success && <p className="text-green-600 text-center font-bold text-sm">Issue reported successfully!</p>}
            {submitState.error && <p className="text-red-600 text-center font-bold text-sm">{submitState.error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
