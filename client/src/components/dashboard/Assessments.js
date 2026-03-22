import React, { useState, useEffect } from 'react';
import { getAssessments, updateAssessmentStatus } from '../../services/studentService';
import { getAdminAssessments, createAssessment, updateAssessment, deleteAssessment } from '../../services/adminService';
import { FileText, Plus, Trash2, Clock, Calendar, AlertCircle, Loader2, Edit2, Eye, Play } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function Assessments({ role = "student" }) {
  const { showNotification } = useNotification();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [formData, setFormData] = useState({
    title: "", duration: 60, deadline: "", description: ""
  });

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const data = role === 'admin' ? await getAdminAssessments() : await getAssessments();
      setAssessments(data || []);
    } catch (err) {
      console.error("Error loading assessments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleDelete = async (id) => {
    if (role !== 'admin') return;
    if (!window.confirm("Delete this assessment?")) return;
    try {
      await deleteAssessment(id);
      setAssessments(assessments.filter(a => a.id !== id));
      showNotification("Assessment deleted", "success", "admin");
    } catch (err) {
      showNotification("Error deleting assessment", "error", "admin");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (isEditing) {
        await updateAssessment(editingId, formData);
        showNotification("Assessment updated", "success", "admin");
      } else {
        await createAssessment(formData);
        showNotification("Assessment created", "success", "admin");
      }
      fetchAssessments();
      setShowModal(false);
      resetForm();
    } catch (err) {
      showNotification(`Error ${isEditing ? 'updating' : 'creating'} assessment`, "error", "admin");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async (id) => {
    try {
      setActionLoading(true);
      await updateAssessmentStatus(id, 'In Progress');
      showNotification("Assessment started! Good luck.", "info", "student");
      fetchAssessments();
    } catch (err) {
      showNotification("Error starting assessment", "error", "student");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: "", duration: 60, deadline: "", description: "" });
  };

  const handleEdit = (test) => {
    setIsEditing(true);
    setEditingId(test.id);
    setFormData({
      title: test.title,
      duration: test.duration,
      deadline: test.deadline.split('T')[0]
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold flex flex-col items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <div className={`p-4 md:p-8 space-y-6 ${isDark ? "feature-dark rounded-[2rem]" : ""}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-500" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Assessments</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(prev => !prev)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-bold shadow-sm">Toggle Theme</button>
          {role === 'admin' && (
            <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
              <Plus className="w-5 h-5" /> New Assessment
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Attempt online tests and view your scores.</p>
      
      {assessments.length === 0 ? (
        <div className="db-placeholder-card mt-8 border-2 border-dashed border-gray-100 dark:border-slate-800 p-12 text-center text-gray-400 font-bold rounded-[2rem]">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No active assessments available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {assessments.map(test => (
            <div key={test.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 group transition-all hover:shadow-md relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{test.title}</h3>
                {role === 'admin' && (
                  <div className="flex gap-2 transition-all">
                    <button onClick={() => handleEdit(test)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(test.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    <Clock className="w-4 h-4" />
                    <span>{test.duration} Minutes</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 border-t border-gray-50 dark:border-slate-700 pt-4">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Ends: {new Date(test.deadline).toLocaleDateString()}</span>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button 
                    onClick={() => { setSelectedTest(test); setShowDetailModal(true); }}
                    className="w-full py-2.5 bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-100 dark:border-slate-700 text-xs flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                  
                  {role === 'student' && (
                    test.status === 'Completed' ? (
                      <div className="w-full py-2.5 bg-green-50 text-green-700 font-bold rounded-xl border border-green-100 text-xs flex items-center justify-center gap-2">
                        Score: {test.score}%
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleStart(test.id)}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/10 text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} {test.status === 'In Progress' ? 'Resume Test' : 'Start Assessment'}
                      </button>
                    )
                  )}

                  {role === 'admin' && (
                    <div className="flex gap-2 justify-end mt-2">
                      <button onClick={() => handleEdit(test)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDelete(test.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
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
      {showDetailModal && selectedTest && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border dark:border-slate-800">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white relative">
              <button onClick={() => setShowDetailModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <h3 className="text-3xl font-black tracking-tight leading-tight uppercase mb-4">{selectedTest.title}</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">Duration: {selectedTest.duration}m</span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">Ends: {new Date(selectedTest.deadline).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="prose dark:prose-invert max-w-none">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500 mb-4">Assessment Brief</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedTest.description || "Comprehensive evaluation centered on the specified topic. Please ensure a stable connection before starting."}</p>
                
                <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Important: Once started, the timer cannot be paused. Make sure you are ready to complete the test in one sitting.</p>
                </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-between items-center">
               <button onClick={() => setShowDetailModal(false)} className="px-6 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all">Close</button>
               {role === 'student' && selectedTest.status !== 'Completed' && (
                 <button onClick={() => { handleStart(selectedTest.id); setShowDetailModal(false); }} className="px-10 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95">
                   {selectedTest.status === 'In Progress' ? 'Resume Test' : 'Start Test Now'}
                 </button>
               )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-800">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">{isEditing ? 'Edit Assessment' : 'Post New Assessment'}</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Test Title</label>
                <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Duration (Mins)</label>
                    <input required type="number" value={formData.duration} onChange={e=>setFormData({...formData, duration: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
                </div>
                <div className="w-1/2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Deadline</label>
                    <input required type="date" value={formData.deadline} onChange={e=>setFormData({...formData, deadline: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
                </div>
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                <textarea value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all h-32"></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border rounded-2xl font-bold">Cancel</button>
                <button disabled={actionLoading} type="submit" className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 flex items-center gap-2">
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
