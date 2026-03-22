import React, { useState, useEffect } from 'react';
import { getEvents, registerForEvent } from '../../services/studentService';
import { getAdminEvents, createEvent, updateEvent, deleteEvent } from '../../services/adminService';
import { Plus, Trash2, Calendar, Users, Loader2, AlertCircle, Edit2, Eye, CheckCircle, Search } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function Events({ role = "student" }) {
  const { showNotification } = useNotification();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", date: "", type: "Workshop", description: ""
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(ev => 
    ev.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = role === 'admin' ? await getAdminEvents() : await getEvents();
      setEvents(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error("Error loading events", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleRegister = async (eventId) => {
    try {
      setActionLoading(true);
      await registerForEvent(eventId);
      showNotification("Successfully registered for event!", "success", "student");
      fetchEvents();
    } catch (err) {
      showNotification(err.message || "Failed to register", "error", "student");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (role !== 'admin') return;
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(id);
      setEvents(events.filter(ev => ev.id !== id));
      showNotification("Event deleted", "success", "admin");
    } catch (err) {
      showNotification("Error deleting event", "error", "admin");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      if (isEditing) {
        await updateEvent(editingId, formData);
        showNotification("Event updated", "success", "admin");
      } else {
        await createEvent(formData);
        showNotification("Event created", "success", "admin");
      }
      fetchEvents();
      setShowModal(false);
      resetForm();
    } catch (err) {
      showNotification(`Error ${isEditing ? 'updating' : 'creating'} event`, "error", "admin");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ title: "", date: "", type: "Workshop", description: "" });
  };

  const handleEdit = (ev) => {
    setIsEditing(true);
    setEditingId(ev.id);
    setFormData({
      title: ev.title,
      description: ev.description,
      date: ev.date.split('T')[0],
      type: ev.type
    });
    setShowModal(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold flex flex-col items-center gap-2"><Loader2 className="animate-spin" /> Loading...</div>;

  return (
    <div className={`p-4 md:p-8 space-y-6 ${isDark ? "feature-dark rounded-[2rem]" : ""}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100">Campus Events</h2>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsDark(prev => !prev)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-bold shadow-sm">Toggle Theme</button>
          {role === 'admin' && (
            <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg active:scale-95">
              <Plus className="w-5 h-5" /> Schedule Event
            </button>
          )}
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Stay updated with campus events, seminars, and workshops.</p>
      
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search events..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
        />
      </div>

      {filteredEvents.length === 0 ? (
        <div className="db-placeholder-card mt-8 border-2 border-dashed border-gray-100 dark:border-slate-800 p-12 text-center text-gray-400 font-bold rounded-[2rem]">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No upcoming events found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredEvents.map(ev => (
            <div key={ev.id} className="bg-white dark:bg-slate-800 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 relative group transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    ev.type === 'Seminar' ? 'bg-purple-100 text-purple-700 border-purple-200' : 
                    ev.type === 'Workshop' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                }`}>{ev.type}</span>
                {role === 'admin' && (
                  <div className="flex gap-2 transition-all">
                    <button onClick={() => handleEdit(ev)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(ev.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{ev.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{ev.description}</p>
              
              <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-50 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest flex-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  {role === 'admin' && (
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md uppercase tracking-widest">
                        <Users className="w-3.5 h-3.5" />
                        <span>{ev.registered_count || 0} Registered</span>
                    </div>
                  )}
              </div>

              <div className="flex flex-col gap-2 mt-4">
                <button 
                  onClick={() => { setSelectedEvent(ev); setShowDetailModal(true); }}
                  className="w-full py-2.5 bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-100 transition-all border border-gray-100 dark:border-slate-700 text-xs flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> View Details
                </button>
                
                {role === 'student' && (
                  ev.registered ? (
                    <div className="w-full py-2.5 bg-green-50 text-green-700 font-bold rounded-xl border border-green-100 text-xs flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Registered
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleRegister(ev.id)}
                      disabled={actionLoading}
                      className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10 text-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />} Register Now
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border dark:border-slate-800">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
              <button onClick={() => setShowDetailModal(false)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <h3 className="text-3xl font-black tracking-tight leading-tight uppercase mb-4">{selectedEvent.title}</h3>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">{selectedEvent.type}</span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">{new Date(selectedEvent.date).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="prose dark:prose-invert max-w-none">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 mb-4">Event Description</h4>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedEvent.description}</p>
              </div>
            </div>
            <div className="p-8 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-800 flex justify-between items-center">
               <button onClick={() => setShowDetailModal(false)} className="px-6 py-3 border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 font-bold rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all">Close</button>
               {role === 'student' && !selectedEvent.registered && (
                 <button onClick={() => { handleRegister(selectedEvent.id); setShowDetailModal(false); }} className="px-10 py-3 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">Register Now</button>
               )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] w-full max-w-lg shadow-2xl border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-tight">{isEditing ? 'Edit Event' : 'Schedule New Event'}</h3>
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Event Title</label>
                <input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
              </div>
              <div>
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Description</label>
                <textarea required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all h-32" />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Date</label>
                    <input required type="date" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all" />
                </div>
                <div className="w-1/2">
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Event Type</label>
                    <select value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 p-3.5 rounded-2xl outline-none font-bold text-gray-900 dark:text-gray-100 transition-all">
                        <option value="Workshop">Workshop</option>
                        <option value="Seminar">Seminar</option>
                        <option value="Webinar">Webinar</option>
                        <option value="Placement Drive">Placement Drive</option>
                    </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 border rounded-2xl font-bold">Cancel</button>
                <button disabled={actionLoading} type="submit" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 flex items-center gap-2">
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
