import React, { useState, useEffect } from "react";
import { getAdminApplications, notifyCandidates } from "../../services/adminService";
import { getAllJobs } from "../../services/companyService"; // Need to fetch jobs list, wait, adminService doesn't have getAllJobs?
import { useNotification } from "../../context/NotificationContext";
import { Loader2, Search, Mail, MessageSquare, CheckCircle, Send, X, Users, RefreshCw, Smartphone, ExternalLink } from "lucide-react";

export default function CandidateCommunication() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterJob, setFilterJob] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationType, setNotificationType] = useState("interview");
  const [actionLoading, setActionLoading] = useState(false);
  
  // WhatsApp Queue State
  const [whatsappResults, setWhatsappResults] = useState([]);
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [waQueueIndex, setWaQueueIndex] = useState(0);
  const [waAutoMode, setWaAutoMode] = useState(false);
  const [waSending, setWaSending] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    instructions: "",     // for interview
    interviewType: "",    // for interview
    programTitle: "",     // for orientation
    description: ""       // for orientation
  });

  const { showNotification } = useNotification();

  const fetchJobsAndData = async () => {
    try {
      setLoading(true);
      // Fetch applications
      const appRes = await getAdminApplications(filterJob, filterStatus);
      setApplications(appRes || []);
      
      // We also need job options. In this mockup we rely on unique jobs from applications 
      // OR we fetch all jobs using an existing endpoint if one exists. 
      // For now, let's extract unique jobs from applications to populate the dropdown to be safe 
      // if we don't have an admin job endpoint readily available.
      
      // Actually, if we use filterJob, we need the FULL list of jobs from the start.
      // Assuming GET /admin/jobs doesn't exist, we can fetch all applications once without filters, 
      // extract jobs, and then filter locally or from backend.
      // For best practice, let's just make the /admin/applications endpoint power everything.
    } catch (err) {
      console.error(err);
      showNotification("Failed to fetch applications", "error", "admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobsAndData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterJob, filterStatus]);

  useEffect(() => {
    // To populate the Jobs dropdown initially with all possible jobs,
    // we fetch applications with 'all' filters once on mount.
    const fetchInitialJobs = async () => {
      try {
        const res = await getAdminApplications("all", "all");
        if (res) {
          const uniqueJobs = Array.from(new Map(res.map(item => [item.job_id, { id: item.job_id, title: item.job_title }])).values());
          setJobs(uniqueJobs || []);
        }
      } catch (err) { }
    };
    fetchInitialJobs();
  }, []);

  const toggleSelection = (candidateId) => {
    const newSelection = new Set(selectedCandidates);
    if (newSelection.has(candidateId)) {
      newSelection.delete(candidateId);
    } else {
      newSelection.add(candidateId);
    }
    setSelectedCandidates(newSelection);
  };

  const selectAll = () => {
    if (selectedCandidates.size === applications.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(applications.map(a => a.application_id)));
    }
  };

  const handleNotifySubmit = async (e) => {
    e.preventDefault();
    if (selectedCandidates.size === 0) {
      showNotification("Please select at least one candidate", "error", "admin");
      return;
    }

    try {
      setActionLoading(true);
      const payload = {
        candidateIds: Array.from(selectedCandidates),
        type: notificationType,
        details: formData
      };

      const res = await notifyCandidates(payload);
      showNotification(`Successfully sent to ${res.sent} candidates (${res.failed} failed)`, "success", "admin");
      
      if (res.whatsappMessages && res.whatsappMessages.length > 0) {
        setWhatsappResults(res.whatsappMessages);
        setWaQueueIndex(0);
        setWaSending(false);
        setWaAutoMode(false);
        setShowWhatsappModal(true);
        setIsModalOpen(false);
      } else {
        setIsModalOpen(false);
      }
      
      setSelectedCandidates(new Set());
      setFormData({
        date: "", time: "", location: "", instructions: "", interviewType: "", programTitle: "", description: ""
      });
    } catch (err) {
      console.error(err);
      showNotification(err.message || "Failed to notify candidates", "error", "admin");
    } finally {
      setActionLoading(false);
    }
  };

  const startWaQueue = () => {
    setWaSending(true);
  };

  const openNextWhatsApp = () => {
    if (waQueueIndex >= whatsappResults.length) return;
    const candidate = whatsappResults[waQueueIndex];
    const encoded = encodeURIComponent(candidate.message);
    window.open(`https://wa.me/${candidate.phone}?text=${encoded}`, '_blank');
    setWaQueueIndex(prev => prev + 1);
  };

  useEffect(() => {
    let timer;
    if (waSending && waAutoMode && waQueueIndex < whatsappResults.length) {
      timer = setTimeout(() => {
        openNextWhatsApp();
      }, 4000);
    }
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [waSending, waAutoMode, waQueueIndex, whatsappResults.length]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Candidate Communication</h2>
          <p className="text-gray-500 font-medium mt-1">Filter candidates and send mass email or WhatsApp notifications.</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
        <div className="flex flex-1 flex-wrap gap-5">
          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Filter by Job</label>
            <div className="relative">
              <select 
                value={filterJob}
                onChange={(e) => setFilterJob(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all text-sm font-bold text-gray-700 cursor-pointer"
              >
                <option value="all">All Jobs</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Filter by Status</label>
            <div className="relative">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all text-sm font-bold text-gray-700 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Selected">Selected</option>
                <option value="Applied">Applied</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={selectedCandidates.size === 0}
          className="self-end mb-1 flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" /> Notify Candidates ({selectedCandidates.size})
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-visible relative">
        <div className="overflow-x-auto rounded-[2rem]">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-4 whitespace-nowrap w-12 text-center">
                  <input 
                    type="checkbox" 
                    onChange={selectAll}
                    checked={applications.length > 0 && selectedCandidates.size === applications.length}
                    className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                  />
                </th>
                <th className="px-6 py-4 whitespace-nowrap">Candidate</th>
                <th className="px-6 py-4 whitespace-nowrap">Contact</th>
                <th className="px-6 py-4 whitespace-nowrap">Job Title</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500 mb-2"/>Loading candidates...</td></tr>
              ) : applications.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-medium">No candidates found for selected filters.</td></tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.application_id} className="hover:bg-green-50/40 transition-all duration-200">
                    <td className="px-6 py-4 text-center">
                      <input 
                        type="checkbox"
                        checked={selectedCandidates.has(app.application_id)}
                        onChange={() => toggleSelection(app.application_id)}
                        className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-200 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm uppercase">{app.student_name}</p>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">ID: {app.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-gray-600 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400"/> {app.email}</span>
                        <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1"><Smartphone className="w-3 h-3 text-gray-400"/> {app.phone || "Not provided"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-bold text-gray-700">{app.job_title}</p>
                        <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">{app.company_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center border ${
                        app.application_status === 'Selected' ? "bg-green-500 text-white border-green-600" : 
                        app.application_status === 'Rejected' ? "bg-red-500 text-white border-red-600" : 
                        app.application_status === 'Shortlisted' ? "bg-blue-100 text-blue-700 border-blue-200" : 
                        "bg-orange-100 text-orange-700 border-orange-200"
                      }`}>
                        {app.application_status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notify Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-green-600" />
                Notify Candidates ({selectedCandidates.size})
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setNotificationType("interview")}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                    notificationType === "interview" 
                    ? "bg-green-600 text-white shadow-md shadow-green-600/20" 
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  Schedule Interview
                </button>
                <button
                  type="button"
                  onClick={() => setNotificationType("orientation")}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                    notificationType === "orientation" 
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20" 
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  }`}
                >
                  Orientation Program
                </button>
              </div>

              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Date</label>
                    <input 
                      type="date" 
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all font-semibold text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Time</label>
                    <input 
                      type="time" 
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all font-semibold text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Location / Meeting Link</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Google Meet Link or Room 302"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all font-semibold text-sm"
                  />
                </div>

                {notificationType === "interview" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Interview Type / Round</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Technical Round 1, HR Interview"
                        value={formData.interviewType}
                        onChange={(e) => setFormData({...formData, interviewType: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all font-semibold text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Instructions (Optional)</label>
                      <textarea 
                        rows={3}
                        placeholder="Any specific instructions for the candidate..."
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 transition-all font-semibold text-sm resize-none"
                      />
                    </div>
                  </>
                )}

                {notificationType === "orientation" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Program Title</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. New Hire Orientation, Pre-placement Talk"
                        value={formData.programTitle}
                        onChange={(e) => setFormData({...formData, programTitle: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-500 transition-all font-semibold text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Description (Optional)</label>
                      <textarea 
                        rows={3}
                        placeholder="Brief overview of the program..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-purple-500 transition-all font-semibold text-sm resize-none"
                      />
                    </div>
                  </>
                )}

                <div className="pt-6 flex mt-6 border-t border-gray-50">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className={`w-full px-6 py-4 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                      notificationType === 'interview' ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {actionLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />} 
                    Send Notifications
                  </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">
                  Emails will be sent automatically. WhatsApp messages can be sent in the next step.
                </p>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsappModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
             <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <h3 className="text-xl font-bold flex items-center gap-2">
                 <Smartphone className="w-6 h-6 text-[#25D366]" />
                 Send WhatsApp Messages
               </h3>
               <button onClick={() => setShowWhatsappModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-xl transition-all">
                 <X className="w-5 h-5" />
               </button>
             </div>
             
             <div className="p-8 pb-4">
               <div className="text-center mb-6">
                 <p className="text-3xl font-black text-gray-900 mb-1">{whatsappResults.length}</p>
                 <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Candidates Selected</p>
               </div>
               
               {/* Progress UI */}
               {waSending && (
                 <div className="mb-8">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm font-bold text-gray-600">Sending {waQueueIndex} of {whatsappResults.length}</span>
                     <span className="text-sm font-bold text-[#25D366]">{Math.round((waQueueIndex / whatsappResults.length) * 100)}%</span>
                   </div>
                   <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                     <div 
                       className="bg-[#25D366] h-3 rounded-full transition-all duration-500 ease-out" 
                       style={{ width: `${(waQueueIndex / whatsappResults.length) * 100}%` }}
                     ></div>
                   </div>
                 </div>
               )}

               {/* Advanced Toggle */}
               {waSending && waQueueIndex < whatsappResults.length && (
                 <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
                   <button
                     onClick={() => setWaAutoMode(false)}
                     className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                       !waAutoMode ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                     }`}
                   >
                     Manual Mode
                   </button>
                   <button
                     onClick={() => setWaAutoMode(true)}
                     className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-all ${
                       waAutoMode ? "bg-white text-[#25D366] shadow-sm" : "text-gray-500 hover:text-gray-700"
                     }`}
                   >
                     Auto Mode <RefreshCw className={`w-3 h-3 ${waAutoMode ? 'animate-spin' : ''}`} />
                   </button>
                 </div>
               )}

               {waSending && !waAutoMode && waQueueIndex < whatsappResults.length && (
                 <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-2xl mb-6">
                   <p className="text-sm text-yellow-800 font-semibold">
                     Click "Next Candidate", hit Send in WhatsApp, then come back and click Next again.
                   </p>
                 </div>
               )}
               
               {waSending && waAutoMode && waQueueIndex < whatsappResults.length && (
                 <div className="text-center p-4 bg-green-50 border border-green-200 rounded-2xl mb-6">
                   <p className="text-sm text-green-800 font-semibold flex items-center justify-center gap-2">
                     <Loader2 className="w-4 h-4 animate-spin"/> Opening next tab automatically every 4 seconds...
                   </p>
                 </div>
               )}
               
               {waQueueIndex >= whatsappResults.length && waSending && (
                 <div className="text-center p-6 bg-green-50 border border-green-200 rounded-2xl mb-6">
                   <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto mb-3" />
                   <p className="text-lg text-green-800 font-black">All Done!</p>
                   <p className="text-sm text-green-600 font-semibold">Messages have been generated for all candidates.</p>
                 </div>
               )}
             </div>
             
             <div className="p-6 pt-0">
               {!waSending ? (
                 <button
                   onClick={startWaQueue}
                   className="w-full px-6 py-4 bg-[#25D366] text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-[#1ebd5a] transition-all shadow-lg shadow-[#25D366]/30 active:scale-95"
                 >
                   <Smartphone className="w-6 h-6" /> Start Sending
                 </button>
               ) : waQueueIndex < whatsappResults.length ? (
                 <button
                   onClick={openNextWhatsApp}
                   disabled={waAutoMode}
                   className="w-full px-6 py-4 bg-gray-900 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   Next Candidate →
                   <span className="text-xs ml-2 opacity-75 font-medium block">
                     ({whatsappResults[waQueueIndex].name})
                   </span>
                 </button>
               ) : (
                 <button
                   onClick={() => setShowWhatsappModal(false)}
                   className="w-full px-6 py-4 bg-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-300 transition-all font-bold"
                 >
                   Close
                 </button>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
