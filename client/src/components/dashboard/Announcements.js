import React, { useState, useEffect } from "react";
import { getAnnouncements as getAdminAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from "../../services/adminService";
import { getAnnouncements as getStudentAnnouncements } from "../../services/studentService";
import { getAnnouncements as getCompanyAnnouncements } from "../../services/companyService";
import { useNotification } from "../../context/NotificationContext";
import {
  Megaphone, Plus, Calendar, Download, Search, MoreVertical,
  CheckCircle, AlertCircle, Trash2, Pin, ChevronLeft, ChevronRight, User, Tag, Clock, Loader2, Edit2, Eye
} from "lucide-react";

import socketService from "../../services/socketService";

export default function Announcements({ role = "admin" }) {
  const { showNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "", category: "Notice", audience: "All Students",
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    is_pinned: false, content: ""
  });

  useEffect(() => {
    fetchAnnouncements();

    const handleNewAnnouncement = (data) => {
        if (role === 'admin' || 
            (role === 'student' && (data.audience === 'All Students' || data.audience.includes('Student'))) ||
            (role === 'company' && data.audience === 'Recruiters')) {
            setAnnouncements(prev => [data, ...prev]);
        }
    };

    socketService.on("newAnnouncement", handleNewAnnouncement);
    return () => socketService.off("newAnnouncement");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      let list = [];
      if (role === 'admin') {
        const data = await getAdminAnnouncements();
        list = data.success ? data.data : data;
      } else if (role === 'company') {
        const data = await getCompanyAnnouncements();
        list = Array.isArray(data) ? data : (data?.data || []);
      } else {
        // student
        const data = await getStudentAnnouncements();
        list = Array.isArray(data) ? data : (data?.data || []);
      }
      setAnnouncements(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching announcements:", err);
      showNotification("Failed to load announcements", "error", role);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (role !== 'admin') return;
    if (!window.confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await deleteAnnouncement(id);
      setAnnouncements(announcements.filter(a => a.id !== id));
      setActiveMenu(null);
      showNotification("Announcement deleted successfully!", "success", "admin");
    } catch (err) {
      showNotification(`Error deleting announcement: ${err.message}`, "error", "admin");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (role !== 'admin') return;
    try {
      setActionLoading(true);
      if (isEditing) {
        await updateAnnouncement(editingId, formData);
        showNotification("Announcement updated successfully!", "success", "admin");
      } else {
        await createAnnouncement(formData);
        showNotification("Announcement created successfully!", "success", "admin");
      }
      fetchAnnouncements();
      setShowModal(false);
      resetForm();
    } catch (err) {
      showNotification(`Error ${isEditing ? 'updating' : 'creating'} announcement`, "error", "admin");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ 
        title: "", category: "Notice", audience: "All Students", 
        start_date: new Date().toISOString().split('T')[0], 
        expiry_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        is_pinned: false, content: "" 
    });
  };

  const handleEdit = (ann) => {
    setIsEditing(true);
    setEditingId(ann.id);
    setFormData({
      title: ann.title,
      content: ann.content,
      category: ann.category,
      audience: ann.audience,
      start_date: ann.start_date.split('T')[0],
      expiry_date: ann.expiry_date ? ann.expiry_date.split('T')[0] : "",
      is_pinned: !!ann.is_pinned
    });
    setShowModal(true);
    setActiveMenu(null);
  };

  const exportToCSV = () => {
    if (announcements.length === 0) return;
    const headers = ["Title", "Category", "Audience", "Start Date", "Expiry Date", "Pinned", "Content"];
    const csvRows = [headers.join(",")];
    
    announcements.forEach(a => {
      const row = [
        `"${a.title}"`, `"${a.category}"`, `"${a.audience}"`, 
        a.start_date.split('T')[0], a.expiry_date ? a.expiry_date.split('T')[0] : "-", 
        a.is_pinned ? "Yes" : "No", `"${a.content.replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "announcements_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = [
    { title: "Total Announcements", value: announcements.length || "0", icon: Megaphone, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Active Announcements", value: announcements.filter(a => !a.expiry_date || new Date(a.expiry_date) > new Date()).length || "0", icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    { title: "Urgent Notices", value: announcements.filter(a => a.is_pinned).length || "0", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { title: "Category: Placement", value: announcements.filter(a => a.category === 'Placement').length || "0", icon: Pin, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  const filteredAnnouncements = announcements.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const paginatedAnnouncements = filteredAnnouncements.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const getStatusStyle = (status) => status === "Active" ? "bg-green-500 text-white border-green-600 shadow-sm" : "bg-gray-100 text-gray-400 border-gray-200";
  const getCategoryStyle = (category) => category === "Placement" ? "bg-indigo-100 text-indigo-700 border-indigo-200" : (category === "Event" ? "bg-purple-100 text-purple-700 border-purple-200" : "bg-orange-100 text-orange-700 border-orange-200");

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isDark ? "feature-dark p-6 rounded-3xl" : ""}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Announcements</h2>
          <p className="text-gray-500 font-medium mt-1">
            {role === 'admin' ? "Create and manage important updates." : "View important updates and notices."}
          </p>
        </div>
        {role === 'admin' && (
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(prev => !prev)} 
              className={`w-[45px] h-[24px] rounded-[20px] relative cursor-pointer transition-colors duration-300 flex-shrink-0 ${isDark ? 'bg-[#22c55e]' : 'bg-[#d1d5db]'}`}
              title="Toggle Theme"
            >
              <div className={`w-[20px] h-[20px] bg-white rounded-full absolute top-[2px] transition-transform duration-300 shadow-sm ${isDark ? 'translate-x-[21px]' : 'translate-x-[2px]'}`} />
            </button>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg active:scale-95">
              <Plus className="w-5 h-5" /> Create
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl py-4 px-5 shadow-sm border border-gray-100 flex items-center gap-4 group hover:-translate-y-1.5 transition-all">
            <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
              <h4 className="text-2xl font-black text-gray-900 mt-0.5">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap items-end gap-4 transition-all hover:shadow-md">
        <div className="flex-1 flex gap-4">
          <div className="relative group flex-1">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-300 group-focus-within:text-green-500">
              <Search className="h-5 w-5" />
            </div>
            <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} placeholder="Search announcements..." className="w-full pl-16 pr-6 py-3.5 border-2 border-gray-100 rounded-2xl outline-none focus:border-green-500 font-semibold" />
          </div>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-3.5 bg-white border-2 border-green-100 text-green-700 font-bold rounded-2xl hover:bg-green-50 transition-all shadow-sm active:scale-95">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? <p className="text-gray-500 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500 mb-2"/>Loading...</p> : 
         paginatedAnnouncements.map((ann) => {
          const status = (!ann.expiry_date || new Date(ann.expiry_date) > new Date()) ? "Active" : "Expired";
          return (
            <div key={ann.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 relative group transition-all duration-300 animate-in slide-in-from-bottom-2">
            {ann.is_pinned && <div className="absolute top-6 left-0 w-1 bg-green-600 h-12 rounded-r-full"></div>}
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-green-700 uppercase tracking-tight">{ann.title}</h3>
                  {ann.is_pinned && <Pin className="w-4 h-4 text-green-600 fill-green-600 rotate-45" />}
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${getCategoryStyle(ann.category)}`}><Tag className="w-3 h-3" />{ann.category}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-gray-200/50 flex items-center gap-1.5"><User className="w-3 h-3" />{ann.audience}</span>
                  {ann.expiry_date && <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-100/50 flex items-center gap-1.5"><Clock className="w-3 h-3" />Expires: {new Date(ann.expiry_date).toLocaleDateString()}</span>}
                </div>
                <p className="text-sm text-gray-700 font-medium mt-2">{ann.content}</p>
              </div>

              <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0 border-gray-50">
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2 border ${getStatusStyle(status)}`}>
                    {status}
                  </span>
                </div>

                {role !== 'admin' && (
                  <button onClick={() => { setSelectedAnnouncement(ann); setShowDetailModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-all border border-blue-100 active:scale-95 whitespace-nowrap">
                    <Eye className="w-4 h-4" /> View Details
                  </button>
                )}

                {role === 'admin' && (
                  <div className="relative">
                    <button onClick={() => setActiveMenu(activeMenu === ann.id ? null : ann.id)} className="p-3 rounded-2xl transition-all text-gray-400 hover:text-green-600 hover:bg-green-50">
                      <MoreVertical className="w-6 h-6" />
                    </button>
                    {activeMenu === ann.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-2">
                        <button onClick={() => handleEdit(ann)} className="w-full px-5 py-3 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => handleDelete(ann.id)} className="w-full px-5 py-3 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-3">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )})}
      </div>

      {/* Pagination View */}
      <div className="bg-white px-8 py-5 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Showing Page {page} of {totalPages === 0 ? 1 : totalPages} ({filteredAnnouncements.length} results)
        </p>
        <div className="flex items-center gap-3">
          <button disabled={page === 1} onClick={() => setPage(page-1)} className="p-2.5 border-2 border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-gray-400">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage(page+1)} className="p-2.5 border-2 border-gray-100 rounded-xl hover:bg-gray-50 disabled:opacity-50 text-gray-600">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white relative">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                  {selectedAnnouncement.category}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                  {selectedAnnouncement.audience}
                </span>
              </div>
              <h3 className="text-3xl font-black tracking-tight leading-tight uppercase">
                {selectedAnnouncement.title}
              </h3>
            </div>
            
            <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-6 mb-8 py-4 border-y border-gray-50">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Posted: {new Date(selectedAnnouncement.start_date).toLocaleDateString()}</span>
                </div>
                {selectedAnnouncement.expiry_date && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expires: {new Date(selectedAnnouncement.expiry_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                  {selectedAnnouncement.content}
                </p>
              </div>
            </div>
            
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setShowDetailModal(false)}
                className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-black rounded-2xl hover:bg-gray-100 transition-all active:scale-95"
              >
                Close Notice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-[200] flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{isEditing ? 'Edit Announcement' : 'Create Announcement'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div><label className="text-sm font-bold">Title</label><input required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded" /></div>
              <div><label className="text-sm font-bold">Content</label><textarea required value={formData.content} onChange={e=>setFormData({...formData, content: e.target.value})} className="w-full border p-2 rounded h-32"></textarea></div>
              <div className="flex gap-4">
                <div className="w-1/2"><label className="text-sm font-bold">Category</label><select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded"><option>Notice</option><option>Placement</option><option>Event</option></select></div>
                <div className="w-1/2"><label className="text-sm font-bold">Audience</label><select value={formData.audience} onChange={e=>setFormData({...formData, audience: e.target.value})} className="w-full border p-2 rounded"><option>All Students</option><option>Final Year</option><option>Recruiters</option></select></div>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2"><label className="text-sm font-bold">Start Date</label><input required type="date" value={formData.start_date} onChange={e=>setFormData({...formData, start_date: e.target.value})} className="w-full border p-2 rounded" /></div>
                <div className="w-1/2"><label className="text-sm font-bold">Expiry Date</label><input required type="date" value={formData.expiry_date} onChange={e=>setFormData({...formData, expiry_date: e.target.value})} className="w-full border p-2 rounded" /></div>
              </div>
              <div><label className="flex items-center gap-2"><input type="checkbox" checked={formData.is_pinned} onChange={e=>setFormData({...formData, is_pinned: e.target.checked})} /> Pin this announcement</label></div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded font-bold">Cancel</button>
                <button disabled={actionLoading} type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 flex items-center gap-2 disabled:opacity-50">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : null} {isEditing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
