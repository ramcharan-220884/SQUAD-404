import React, { useState, useEffect } from 'react';
import { getInterviews } from '../../services/studentService';
import { getAdminInterviews, createInterview, deleteInterview } from '../../services/adminService';
import { Mic, Plus, Trash2, Clock, Building, User, Loader2, AlertCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { MoreVertical, Edit2, Eye } from 'lucide-react';

export default function Interviews({ role = "student" }) {
  const { showNotification } = useNotification();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: "", role: "", date: "", round: "Technical Round"
  });

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const data = role === 'admin' ? await getAdminInterviews() : await getInterviews();
      setInterviews(data || []);
    } catch (err) {
      console.error("Error loading interviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleDelete = async (id) => {
    if (role !== 'admin') return;
    if (!window.confirm("Delete this scheduled interview?")) return;
    try {
      await deleteInterview(id);
      setInterviews(interviews.filter(i => i.id !== id));
      setActiveMenu(null);
      showNotification("Interview deleted", "success", "admin");
    } catch (err) {
      showNotification("Error deleting interview", "error", "admin");
    }
  };

  const handleEdit = (inv) => {
    setIsEditing(true);
    setEditingId(inv.id);
    setFormData({
      company: inv.company,
      role: inv.role,
      date: inv.date ? inv.date.replace('Z', '') : "", // format for datetime-local
      round: inv.round
    });
    setShowModal(true);
    setActiveMenu(null);
  };
  
  const resetForm = () => {
      setIsEditing(false);
      setEditingId(null);
      setFormData({ company: "", role: "", date: "", round: "Technical Round" });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (isEditing) {
        // await updateInterview(editingId, formData); // Assuming updateInterview is added to adminService
        const { updateInterview } = await import('../../services/adminService');
        if (updateInterview) {
            await updateInterview(editingId, formData);
            showNotification("Interview updated", "success", "admin");
        }
      } else {
        await createInterview(formData);
        showNotification("Interview scheduled", "success", "admin");
      }
      fetchInterviews();
      setShowModal(false);
      resetForm();
    } catch (err) {
      showNotification(`Error ${isEditing ? 'updating' : 'scheduling'} interview`, "error", "admin");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold flex flex-col items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Mic className="w-8 h-8 text-emerald-500" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Interviews</h2>
        </div>
        {role === 'admin' && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95">
            <Plus className="w-5 h-5" /> Schedule Interview
          </button>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Track scheduled interviews and past results.</p>
      
      {interviews.length === 0 ? (
        <div className="db-placeholder-card mt-8 border-2 border-dashed border-gray-100 dark:border-slate-800 p-12 text-center text-gray-400 font-bold rounded-[2rem]">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No scheduled interviews at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {interviews.map(inv => (
            <div key={inv.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 group transition-all hover:shadow-md relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{inv.company}</h3>
                </div>
                
                <div className="flex items-center gap-2 relative">
                    {role !== 'admin' && (
                      <button onClick={() => { setSelectedInterview(inv); setShowDetailModal(true); }} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 font-bold rounded-xl hover:bg-emerald-100 transition-all border border-emerald-100 active:scale-95 text-xs">
                        <Eye className="w-3.5 h-3.5" /> Details
                      </button>
                    )}

                    {role === 'admin' && (
                      <>
                        <button onClick={() => setActiveMenu(activeMenu === inv.id ? null : inv.id)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        {activeMenu === inv.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2">
                            <button onClick={() => handleEdit(inv)} className="w-full px-5 py-3 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                                <Edit2 className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => handleDelete(inv.id)} className="w-full px-5 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
                            </div>
                        )}
                      </>
                    )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{inv.role}</span>
                </div>
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl">
                    <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Interview Round</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{inv.round}</p>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mt-4 pt-4 border-t border-gray-50 dark:border-slate-700">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(inv.date).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
                {isEditing ? "Edit Interview" : "Schedule Interview"}
            </h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Company Name</label>
                    <input required value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" placeholder="E.g. Google" />
                </div>
                <div className="w-1/2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Job Role</label>
                    <input required value={formData.role} onChange={e=>setFormData({...formData, role: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" placeholder="E.g. SDE-1" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Interview Round</label>
                <select value={formData.round} onChange={e=>setFormData({...formData, round: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all">
                    <option value="Aptitude Test">Aptitude Test</option>
                    <option value="Technical Round">Technical Round</option>
                    <option value="HR Round">HR Round</option>
                    <option value="Final Selection">Final Selection</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Date & Time</label>
                <input required type="datetime-local" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border-2 border-gray-100 dark:border-slate-800 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                <button disabled={actionLoading} type="submit" className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all uppercase tracking-widest text-xs">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : null} {isEditing ? "Save Changes" : "Schedule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal for Students/Companies */}
      {showDetailModal && selectedInterview && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white relative">
                <h3 className="text-2xl font-black tracking-tight uppercase">
                    {selectedInterview.company}
                </h3>
                <p className="text-emerald-100 font-bold mt-1 text-sm">{selectedInterview.role}</p>
            </div>
            <div className="p-8 space-y-6">
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <Clock className="w-6 h-6 text-emerald-600" />
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Date & Time</p>
                        <p className="font-bold text-gray-900">{new Date(selectedInterview.date).toLocaleString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Interview Round</p>
                        <p className="font-bold text-gray-900">{selectedInterview.round}</p>
                    </div>
                </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button onClick={() => setShowDetailModal(false)} className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-black rounded-xl hover:bg-gray-100 transition-all active:scale-95 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
