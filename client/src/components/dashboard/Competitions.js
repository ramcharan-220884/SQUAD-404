import React, { useState, useEffect } from 'react';
import { getCompetitions, registerForCompetition } from '../../services/studentService';
import { getAdminCompetitions, createCompetition, updateCompetition, deleteCompetition } from '../../services/adminService';
import { Plus, Trash2, Calendar, Trophy, AlertCircle, Loader2, Edit2, Eye, CheckCircle, Search, Users } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function Competitions({ role = "student" }) {
  const { showNotification } = useNotification();
  const [comps, setComps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", prize: "", deadline: "", status: "Open", description: ""
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredComps = comps.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchComps = async () => {
    try {
      setLoading(true);
      const data = role === 'admin' ? await getAdminCompetitions() : await getCompetitions();
      setComps(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Error loading competitions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComps();
  }, [role]);

  const handleRegister = async (compId) => {
    try {
      setActionLoading(true);
      await registerForCompetition(compId);
      showNotification("Successfully registered for competition!", "success", "student");
      fetchComps(); // Refresh to show registered status
    } catch (err) {
      showNotification(err.message || "Failed to register", "error", "student");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (role !== 'admin') return;
    if (!window.confirm("Delete this competition?")) return;
    try {
      await deleteCompetition(id);
      setComps(comps.filter(c => c.id !== id));
      showNotification("Competition deleted", "success", "admin");
    } catch (err) {
      showNotification("Error deleting competition", "error", "admin");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (isEditing) {
        await updateCompetition(editingId, formData);
        showNotification("Competition updated", "success", "admin");
      } else {
        await createCompetition(formData);
        showNotification("Competition created", "success", "admin");
      }
      fetchComps();
      setShowModal(false);
      resetForm();
    } catch (err) {
      showNotification(`Error ${isEditing ? 'updating' : 'creating'} competition`, "error", "admin");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: "", prize: "", deadline: "", status: "Open" });
  };

  const handleEdit = (comp) => {
    setIsEditing(true);
    setEditingId(comp.id);
    setFormData({
      title: comp.title,
      prize: comp.prize,
      deadline: comp.deadline.split('T')[0],
      status: comp.status
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold flex flex-col items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-orange-500" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Competitions</h2>
        </div>
        {role === 'admin' && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg active:scale-95">
            <Plus className="w-5 h-5" /> Add New
          </button>
        )}
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Participate in coding contests, hackathons, and more.</p>
      
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search competitions..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
        />
      </div>

      {filteredComps.length === 0 ? (
        <div className="db-placeholder-card mt-8 border-2 border-dashed border-gray-100 dark:border-slate-800 p-12 text-center text-gray-400 font-bold rounded-[2rem]">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No active competitions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredComps.map(c => (
            <div key={c.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 relative overflow-hidden group transition-all hover:shadow-md">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity" />
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{c.title}</h3>
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${c.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.status}</span>
              </div>
              
              <div className="space-y-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-2xl">
                    <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Prize Pool</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{c.prize}</p>
                </div>

                <div className="flex items-center justify-between ">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Ends: {new Date(c.deadline).toLocaleDateString()}</span>
                    </div>
                    {role === 'admin' && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md uppercase tracking-widest">
                          <Users className="w-3.5 h-3.5" />
                          <span>{c.registered_count || 0} Registered</span>
                      </div>
                    )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button 
                    onClick={() => { setSelectedComp(c); setShowDetailModal(true); }}
                    className="w-full py-2.5 bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-100 dark:border-slate-700 text-xs flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                  
                  {role === 'student' && (
                    c.registered ? (
                      <div className="w-full py-2.5 bg-green-50 text-green-700 font-bold rounded-xl border border-green-100 text-xs flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Registered
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleRegister(c.id)}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/10 text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />} Register Now
                      </button>
                    )
                  )}

                  {role === 'admin' && (
                    <div className="flex gap-2 justify-end mt-2">
                      <button onClick={() => handleEdit(c)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedComp && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border dark:border-slate-800">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 text-white relative">
              <button onClick={() => setShowDetailModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <h3 className="text-3xl font-black tracking-tight leading-tight uppercase mb-4">{selectedComp.title}</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">Prize: {selectedComp.prize}</span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">Ends: {new Date(selectedComp.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="prose dark:prose-invert max-w-none">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 mb-4">About Competition</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedComp.description || "No detailed description provided."}</p>
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-between items-center">
               <button onClick={() => setShowDetailModal(false)} className="px-6 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all">Close</button>
               {role === 'student' && !selectedComp.registered && (
                 <button onClick={() => { handleRegister(selectedComp.id); setShowDetailModal(false); }} className="px-10 py-3 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 active:scale-95">Register Now</button>
               )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-800">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">{isEditing ? 'Edit Competition' : 'Create Competition'}</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Competition Title</label>
                <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Prize Pool</label>
                    <input required value={formData.prize} onChange={e=>setFormData({...formData, prize: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
                </div>
                <div className="w-1/2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Deadline</label>
                    <input required type="date" value={formData.deadline} onChange={e=>setFormData({...formData, deadline: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                <textarea value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all h-32"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border rounded-2xl font-bold">Cancel</button>
                <button disabled={actionLoading} type="submit" className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 flex items-center gap-2">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : null} {isEditing ? 'Save Changes' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
