import React, { useState, useEffect, useCallback } from 'react';
import { getCompetitions, registerForCompetition, submitCompetition } from '../../services/studentService';
import { getAdminCompetitions, createCompetition, updateCompetition, deleteCompetition, updateCompetitionStatus } from '../../services/adminService';
import {
  Plus, Trash2, Calendar, Trophy, AlertCircle, Loader2,
  Edit2, Eye, CheckCircle, Search, Users, Clock, XCircle, Link as LinkIcon
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const CATEGORY_STYLES = {
  'Hackathon':      'bg-indigo-100 text-indigo-700 border-indigo-200',
  'Coding Contest': 'bg-pink-100 text-pink-700 border-pink-200',
  'Quiz':           'bg-purple-100 text-purple-700 border-purple-200',
  'Challenge':      'bg-orange-100 text-orange-700 border-orange-200',
};
const getCategoryStyle = (cat) => CATEGORY_STYLES[cat] || 'bg-orange-100 text-orange-700 border-orange-200';

export default function Competitions({ role = "student" }) {
  const { showNotification } = useNotification();

  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "Hackathon", date: "", link: ""
  });
  const [searchTerm, setSearchTerm] = useState('');

  // ── Fetch competitions from backend ─────────────────────────────────────────
  const fetchComps = useCallback(async () => {
    try {
      setLoading(true);
      const data = role === 'admin'
        ? await getAdminCompetitions()
        : await getCompetitions();
      setCompetitions(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Error loading competitions", err);
      showNotification("Failed to load competitions", "error", role);
    } finally {
      setLoading(false);
    }
  }, [role, showNotification]);

  useEffect(() => { fetchComps(); }, [fetchComps]);

  // Derived groups
  const approvedComps = competitions.filter(c => c.status === 'approved' || (role === 'admin' && !c.status));
  const pendingComps  = role === 'admin' ? competitions.filter(c => c.status === 'pending') : [];

  const filteredComps = approvedComps.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Student: register ──────────────────────────────────────────────────────
  const handleRegister = async (compId) => {
    try {
      setActionLoading(true);
      await registerForCompetition(compId);
      showNotification("Successfully registered for competition!", "success", "student");
      fetchComps();
    } catch (err) {
      showNotification(err.message || "Failed to register", "error", "student");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Admin: delete ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (role !== 'admin') return;
    if (!window.confirm("Delete this competition?")) return;
    try {
      await deleteCompetition(id);
      fetchComps();
      showNotification("Competition deleted", "success", "admin");
    } catch (err) {
      showNotification("Error deleting competition", "error", "admin");
    }
  };

  // ── Form submit ────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);

      if (role === 'student') {
        const payload = {
          ...formData,
          date: formData.date,
          registrationLink: formData.link
        };
        await submitCompetition(payload);
        showNotification("Competition submitted for admin approval!", "success", "student");
        setShowModal(false);
        resetForm();
        fetchComps();
        return;
      }

      // Admin logic
      const adminPayload = {
        ...formData,
        date: formData.date,
        registrationLink: formData.link,
        status: isEditing ? competitions.find(c => c.id === editingId)?.status : 'approved'
      };

      if (isEditing) {
        await updateCompetition(editingId, adminPayload);
        showNotification("Competition updated", "success", "admin");
      } else {
        await createCompetition({ ...adminPayload, status: 'approved' });
        showNotification("Competition created", "success", "admin");
      }
      fetchComps();
      setShowModal(false);
      resetForm();
    } catch (err) {
      showNotification(err.message || `Error ${isEditing ? 'updating' : 'creating'} competition`, "error", "admin");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: "", description: "", category: "Hackathon", date: "", link: "" });
  };

  const handleEdit = (comp) => {
    setIsEditing(true);
    setEditingId(comp.id);
    setFormData({
      title: comp.title,
      description: comp.description || "",
      category: comp.category || "Hackathon",
      date: comp.date ? comp.date.split('T')[0] : "",
      link: comp.registrationLink || comp.link || ""
    });
    setShowModal(true);
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      setActionLoading(true);
      await updateCompetitionStatus(id, status);
      showNotification(`Competition ${status === 'approved' ? 'approved' : 'rejected'}.`, "success", "admin");
      fetchComps();
    } catch (err) {
      showNotification("Failed to update status", "error", "admin");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="p-8 text-center text-gray-500 font-bold flex flex-col items-center gap-2">
      <Loader2 className="animate-spin" /> Loading...
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-orange-500" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Competitions</h2>
        </div>
        <div className="flex gap-3">
          {role === 'admin' && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-all shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5" /> Add New
            </button>
          )}
          {role === 'student' && (
            <button
              onClick={() => { resetForm(); setShowModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 active:scale-95"
            >
              <Plus className="w-5 h-5" /> Post Competition
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Participate in coding contests, hackathons, and more.</p>

      {/* ── Search ──────────────────────────────────────────────────────────── */}
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

      {/* ── Approved Competitions Grid ───────────────────────────────────────── */}
      {filteredComps.length === 0 ? (
        <div className="db-placeholder-card mt-8 border-2 border-dashed border-gray-100 dark:border-slate-800 p-12 text-center text-gray-400 font-bold rounded-[2rem]">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>No active competitions found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredComps.map(c => (
            <div key={c.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 relative group transition-all hover:shadow-md hover:-translate-y-1">
              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400 to-red-500 opacity-5 rounded-bl-full group-hover:opacity-10 transition-opacity" />

              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getCategoryStyle(c.category)}`}>
                    {c.category || 'General'}
                  </span>
                  {c.status === 'approved' && (
                    <span className="px-2 py-1 rounded-full text-[9px] font-black uppercase bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  )}
                </div>
                {role === 'admin' && (
                  <div className="flex gap-2 transition-all opacity-0 group-hover:opacity-100">
                    <button onClick={() => handleEdit(c)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-xl transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{c.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{c.description}</p>

              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-50 dark:border-slate-700">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{c.date ? new Date(c.date).toLocaleDateString() : 'TBD'}</span>
                </div>
                {role === 'admin' && typeof c.registered_count !== 'undefined' && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md uppercase tracking-widest">
                    <Users className="w-3.5 h-3.5" />
                    <span>{c.registered_count || 0} Registered</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-4">
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
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Admin Only: Pending Student Submissions ──────────────────────────── */}
      {role === 'admin' && pendingComps.length > 0 && (
        <div className="mt-12 pt-8 border-t-2 border-dashed border-orange-200 dark:border-orange-900/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Pending Competition Requests</h3>
              <p className="text-xs text-orange-600 font-bold uppercase tracking-wider">Submitted by students — awaiting your approval</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingComps.map(c => (
              <div key={c.id} className="bg-orange-50/50 dark:bg-orange-900/10 p-6 rounded-[2rem] border border-orange-200/60 dark:border-orange-800/30 relative shadow-sm hover:shadow-md transition-all">
                <span className="absolute top-4 right-4 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[9px] font-black uppercase flex items-center gap-1 border border-orange-200">
                  <Clock className="w-3 h-3" /> Pending
                </span>
                <div className="mb-2">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase border ${getCategoryStyle(c.category)}`}>{c.category}</span>
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1 leading-tight pr-20">{c.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">{c.description}</p>

                <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-gray-500 uppercase">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{c.date ? new Date(c.date).toLocaleDateString() : 'TBD'}</span>
                </div>

                <div className="flex flex-col gap-2 mb-4">
                   <button
                    onClick={() => { setSelectedComp(c); setShowDetailModal(true); }}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 hover:underline"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Full Details
                  </button>
                  {(c.registrationLink || c.link) && (
                    <a
                      href={(c.registrationLink || c.link).startsWith('http') ? (c.registrationLink || c.link) : `https://${c.registrationLink || c.link}`}
                      target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 hover:underline"
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Registration Link
                    </a>
                  )}
                </div>

                <div className="flex gap-3 mt-auto">
                  <button
                    onClick={() => handleStatusUpdate(c.id, 'approved')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(c.id, 'rejected')}
                    disabled={actionLoading}
                    className="flex-1 py-2.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Detail Modal ─────────────────────────────────────────────────────── */}
      {showDetailModal && selectedComp && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border dark:border-slate-800">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 p-8 text-white relative">
              <button onClick={() => setShowDetailModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <h3 className="text-3xl font-black tracking-tight leading-tight uppercase mb-4">{selectedComp.title}</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">{selectedComp.category}</span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                  {selectedComp.date ? new Date(selectedComp.date).toLocaleDateString() : 'TBD'}
                </span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${selectedComp.status === 'approved' ? 'bg-green-500/80 border-green-400' : 'bg-orange-500/80 border-orange-400'}`}>
                  {selectedComp.status || 'Active'}
                </span>
              </div>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="prose dark:prose-invert max-w-none">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-500 mb-4">About Competition</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedComp.description || "No detailed description provided."}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Category</h5>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedComp.category}</p>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Submitted By</h5>
                    <p className="font-bold text-gray-900 dark:text-white">{selectedComp.creator_name || 'Administrator'}</p>
                  </div>
                </div>

                {(selectedComp.registrationLink || selectedComp.link) && (
                  <div className="mt-8 p-6 bg-orange-50 dark:bg-orange-900/20 rounded-3xl border border-orange-100 dark:border-orange-800/50">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-3">Registration & Participation</h5>
                    <a href={(selectedComp.registrationLink || selectedComp.link).startsWith('http') ? (selectedComp.registrationLink || selectedComp.link) : `https://${selectedComp.registrationLink || selectedComp.link}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-900 dark:text-white font-black hover:underline group">
                      <div className="p-2 bg-orange-500 text-white rounded-lg group-hover:scale-110 transition-transform">
                        <LinkIcon className="w-4 h-4" />
                      </div>
                      Go to Registration Page
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-between items-center">
              <button onClick={() => setShowDetailModal(false)} className="px-6 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all">Close</button>
              {role === 'student' && !selectedComp.registered && selectedComp.status === 'approved' && (
                <button onClick={() => { handleRegister(selectedComp.id); setShowDetailModal(false); }} className="px-10 py-3 bg-orange-600 text-white font-black rounded-2xl hover:bg-orange-700 transition-all shadow-xl shadow-orange-500/20 active:scale-95">Register Now</button>
              )}
              {role === 'admin' && selectedComp.status === 'pending' && (
                <div className="flex gap-3">
                   <button onClick={() => { handleStatusUpdate(selectedComp.id, 'approved'); setShowDetailModal(false); }} className="px-6 py-3 bg-green-500 text-white font-bold rounded-2xl hover:bg-green-600 transition-all">Approve</button>
                   <button onClick={() => { handleStatusUpdate(selectedComp.id, 'rejected'); setShowDetailModal(false); }} className="px-6 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-all">Reject</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Post / Create Competition Modal ──────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">
              {role === 'student' ? 'Post New Competition' : (isEditing ? 'Edit Competition' : 'Create Competition')}
            </h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Competition Title</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all"
                  placeholder="e.g. National Coding Olympiad" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all h-32"
                  placeholder="Details about the competition..." />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Date</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
                </div>
                <div className="w-1/2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all">
                    <option value="Hackathon">Hackathon</option>
                    <option value="Coding Contest">Coding Contest</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Challenge">Challenge</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Registration Link (Optional)</label>
                <input type="url" value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-orange-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all"
                  placeholder="https://..." />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border rounded-2xl font-bold hover:bg-gray-50 transition-colors">Cancel</button>
                <button disabled={actionLoading} type="submit"
                  className={`px-8 py-3 text-white rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${role === 'student' ? 'bg-green-600 hover:bg-green-700 shadow-green-600/30' : 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/30'}`}>
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {role === 'student' ? 'Submit for Approval' : (isEditing ? 'Save Changes' : 'Publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
