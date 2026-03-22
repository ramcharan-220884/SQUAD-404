import React, { useState } from 'react';
import { Mic, Search, ChevronDown, ChevronUp, Clock, Building, User, AlertCircle, Eye, Plus, X, CheckSquare, Users } from 'lucide-react';

const MOCK_STUDENTS = [
  { id: 1, name: "Rahul" },
  { id: 2, name: "Anjali" },
  { id: 3, name: "Kiran" }
];

export default function Interviews({ role = "student" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    round: "Technical",
    date: ""
  });
  
  // Track assigned students per interview ID: { interviewId: [studentId, ...] }
  const [assignedStudents, setAssignedStudents] = useState({});
  // Track active mode per interview ID: { interviewId: "details" | "assign" | "view" }
  const [interviewModes, setInterviewModes] = useState({});

  const [interviews, setInterviews] = useState([
    {
      id: 1,
      company: "Google",
      role: "SDE-1",
      round: "Technical",
      date: "25-03-2026 10:00 AM",
      status: "Scheduled",
      expanded: false
    },
    {
      id: 2,
      company: "Amazon",
      role: "Intern",
      round: "HR",
      date: "26-03-2026 02:00 PM",
      status: "Scheduled",
      expanded: false
    }
  ]);

  const toggleExpand = (id) => {
    setInterviews(interviews.map(inv => 
      inv.id === id ? { ...inv, expanded: !inv.expanded } : inv
    ));
    // Reset mode to details when expanding/collapsing
    if (!interviewModes[id]) {
      setInterviewModes({ ...interviewModes, [id]: "details" });
    }
  };

  const updateStatus = (id, newStatus) => {
    setInterviews(interviews.map(inv => 
      inv.id === id ? { ...inv, status: newStatus } : inv
    ));
  };

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role || !formData.date || !formData.round) {
      alert("Please fill in all fields");
      return;
    }

    const newInterview = {
      id: Date.now(),
      company: formData.company,
      role: formData.role,
      round: formData.round,
      date: formData.date.replace('T', ' '),
      status: "Scheduled",
      expanded: false
    };

    setInterviews([newInterview, ...interviews]);
    setShowModal(false);
    setFormData({ company: "", role: "", round: "Technical", date: "" });
  };

  const handleStudentSelect = (interviewId, studentId) => {
    const currentAssigned = assignedStudents[interviewId] || [];
    if (currentAssigned.includes(studentId)) {
      setAssignedStudents({
        ...assignedStudents,
        [interviewId]: currentAssigned.filter(id => id !== studentId)
      });
    } else {
      setAssignedStudents({
        ...assignedStudents,
        [interviewId]: [...currentAssigned, studentId]
      });
    }
  };

  const setMode = (interviewId, mode) => {
    setInterviewModes({ ...interviewModes, [interviewId]: mode });
  };

  const filteredInterviews = interviews.filter(inv =>
    inv.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (role !== "admin") {
    return (
      <div className="p-8 text-center text-gray-500 font-bold">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <p>This view is currently optimized for Admin access.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6 bg-gray-50 min-h-full relative font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Mic className="w-8 h-8 text-emerald-500" />
          <h2 className="text-2xl font-black text-gray-900">Interviews</h2>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          <Plus size={20} />
          Schedule Interview
        </button>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h3 className="text-xl font-bold text-gray-800">All Interviews</h3>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-xl outline-none font-bold text-sm transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-6 py-4">Company</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Round</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400 font-bold">
                    No interviews found matching "{searchTerm}"
                  </td>
                </tr>
              ) : (
                filteredInterviews.map((inv) => {
                  const mode = interviewModes[inv.id] || "details";
                  const assigned = assignedStudents[inv.id] || [];
                  
                  return (
                    <React.Fragment key={inv.id}>
                      <tr className="bg-white hover:bg-gray-50/50 transition-all border-y border-gray-100">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                              <Building size={16} />
                            </div>
                            <span className="font-bold text-gray-900">{inv.company}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-600">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-gray-400" />
                            {inv.role}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
                            {inv.round}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock size={14} className="text-gray-400" />
                            {inv.date}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={inv.status}
                            onChange={(e) => updateStatus(inv.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold outline-none border-2 transition-all ${
                              inv.status === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : inv.status === 'Ongoing'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : 'bg-blue-50 text-blue-700 border-blue-100'
                            }`}
                          >
                            <option value="Scheduled">Scheduled</option>
                            <option value="Ongoing">Ongoing</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleExpand(inv.id)}
                            className={`flex items-center gap-2 ml-auto px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                              inv.expanded 
                                ? 'bg-gray-900 text-white shadow-lg' 
                                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-100'
                            }`}
                          >
                            <Eye size={14} />
                            {inv.expanded ? 'Hide Details' : 'View'}
                            {inv.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </td>
                      </tr>
                      {inv.expanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan="6" className="px-6 py-6 border-x border-b border-gray-100 rounded-b-2xl animate-in slide-in-from-top-2 duration-200">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-6">
                              <div className="flex justify-between items-start">
                                <div className="space-y-4 flex-1">
                                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                                    <AlertCircle size={14} />
                                    Interview Details & Instructions
                                  </h4>
                                  <div className="space-y-2">
                                    <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">Instructions for Admin</p>
                                    <p className="text-sm text-gray-600 leading-relaxed font-medium">
                                      Please ensure the candidate has received the meeting link via email. 
                                      Check if the interviewer is available and confirmed for this {inv.round} round.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="pt-6 border-t border-gray-50">
                                {mode === "details" && (
                                  <button 
                                    onClick={() => setMode(inv.id, "assign")}
                                    className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 active:scale-95"
                                  >
                                    <Plus size={14} /> Assign Students
                                  </button>
                                )}

                                {mode === "assign" && (
                                  <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-200">
                                    <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                      <CheckSquare size={16} className="text-emerald-500" />
                                      Select Students to Assign
                                    </h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {MOCK_STUDENTS.map(student => (
                                        <label key={student.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100 group">
                                          <input 
                                            type="checkbox" 
                                            checked={assigned.includes(student.id)}
                                            onChange={() => handleStudentSelect(inv.id, student.id)}
                                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                          />
                                          <span className="text-sm font-bold text-gray-700 group-hover:text-emerald-700">{student.name}</span>
                                        </label>
                                      ))}
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                      <button 
                                        onClick={() => setMode(inv.id, "view")}
                                        className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all shadow-md flex items-center gap-2 active:scale-95"
                                      >
                                        <Users size={14} /> View Students
                                      </button>
                                      <button 
                                        onClick={() => setMode(inv.id, "details")}
                                        className="px-6 py-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                                      >
                                        Back to Details
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {mode === "view" && (
                                  <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
                                    <h5 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                      <Users size={16} className="text-emerald-500" />
                                      Assigned Students
                                    </h5>
                                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
                                      {assigned.length === 0 ? (
                                        <p className="text-sm text-gray-400 font-medium italic">No students assigned yet.</p>
                                      ) : (
                                        <ul className="list-disc list-inside space-y-1">
                                          {assigned.map(id => {
                                            const student = MOCK_STUDENTS.find(s => s.id === id);
                                            return <li key={id} className="text-sm font-bold text-emerald-700">{student?.name}</li>;
                                          })}
                                        </ul>
                                      )}
                                    </div>
                                    <div className="flex gap-3">
                                      <button 
                                        onClick={() => setMode(inv.id, "assign")}
                                        className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-md flex items-center gap-2 active:scale-95"
                                      >
                                        <Plus size={14} /> Assign Students
                                      </button>
                                      <button 
                                        onClick={() => setMode(inv.id, "details")}
                                        className="px-6 py-2.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                                      >
                                        Back to Details
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" onClick={() => setShowModal(false)} />
          
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative z-10 p-8 border border-white/20 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-600">
                  <Plus size={24} />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Schedule</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Company Name</label>
                <div className="relative">
                  <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Google"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Job Role</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. SDE-1"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Round</label>
                  <select
                    value={formData.round}
                    onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm transition-all appearance-none cursor-pointer"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR">HR</option>
                    <option value="Aptitude">Aptitude</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block ml-1">Date & Time</label>
                  <input
                    required
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 rounded-2xl outline-none font-bold text-sm transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3.5 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
