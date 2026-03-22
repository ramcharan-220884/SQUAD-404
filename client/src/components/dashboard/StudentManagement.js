import React, { useState, useEffect } from "react";
import { getAllStudents, approveUser, rejectUser, updateStudentAdmin } from "../../services/adminService";
import { useNotification } from "../../context/NotificationContext";
import {
  Search, Download, MoreVertical, Users, CheckCircle,
  XCircle, ChevronLeft, ChevronRight, GraduationCap, Eye, Edit2, User, Loader2
} from "lucide-react";

export default function StudentManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);

  // Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', branch: '', cgpa: '', status: '', placed_status: '' });

  const [isDark, setIsDark] = useState(false);

  const { showNotification } = useNotification();

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getAllStudents(page, limit);
      const data = res.data || res;
      setStudents(data);
      
      const total = res.pagination?.total || data.length;
      setTotalStudents(total);

      const placedStudents = data.filter(s => s.status === 'Selected' || s.placed_status === 'Placed').length;
      const unplacedStudents = total - placedStudents;

      setStats([
        { title: "Total Students", value: String(total), icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
        { title: "Placed Students", value: String(placedStudents), icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
        { title: "Not Placed Students", value: String(unplacedStudents), icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
      ]);
    } catch (err) {
      console.error("Error fetching students:", err);
      showNotification("Failed to fetch students", "error", "admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleAction = async (id, action) => {
    try {
      setActionLoading(id);
      if (action === "Approve") {
        await approveUser(id, "student");
      } else if (action === "Reject") {
        await rejectUser(id, "student");
      }
      showNotification(`Student ${action}d successfully`, "success", "admin");
      setActiveMenu(null);
      fetchStudents();
    } catch (err) {
      console.error(`Failed to ${action} student`, err);
      showNotification(`Failed to ${action} student`, "error", "admin");
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = () => {
    if (students.length === 0) return;
    const headers = ["ID", "Name", "Email", "Branch", "CGPA", "Status", "Applications"];
    const csvRows = [headers.join(",")];
    
    students.forEach(s => {
      const row = [
        s.id, `"${s.name}"`, `"${s.email}"`, s.branch || "-", 
        s.cgpa || "-", s.status || "Pending", s.applicationsCount || 0
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const toggleMenu = (id) => {
    setActiveMenu(activeMenu === id ? null : id);
  };

  const totalPages = Math.ceil(totalStudents / limit);

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.branch?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.id)?.includes(searchQuery)
  );

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 ${isDark ? "feature-dark rounded-3xl p-6" : ""}`}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Management</h2>
          <p className="text-gray-500 font-medium mt-1">Manage and track student placement progress.</p>
        </div>
        <button onClick={() => setIsDark(prev => !prev)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-bold shadow-sm">Toggle Theme</button>
      </div>

      <div className="max-w-5xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl py-3 px-4 shadow-sm border border-gray-100 flex items-center gap-3 relative overflow-hidden">
              <div className={`p-2.5 ${stat.bg} ${stat.color} rounded-2xl relative z-10`}>
                <stat.icon className="w-7 h-7" />
              </div>
              <div className="relative z-10">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.15em] shrink-0">{stat.title}</p>
                <h4 className="text-2xl font-black text-gray-900 mt-0.5 tracking-tight">{stat.value}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-wrap items-center gap-4 transition-all hover:shadow-md">
        <div className="flex flex-1 flex-wrap gap-5">
          <div className="flex flex-col gap-2 flex-1 min-w-[180px]">
            <label className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.15em] ml-1">Branch</label>
            <div className="relative group">
              <select className="w-full pl-4 pr-10 py-3 bg-gray-50/50 border-2 border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/5 transition-all text-sm font-bold text-gray-700 cursor-pointer">
                <option>All Branches</option>
                <option>CSE</option>
                <option>ECE</option>
                <option>EEE</option>
              </select>
            </div>
          </div>
        </div>
        
        <button onClick={exportToCSV} className="self-end mb-1 flex items-center gap-2 px-6 py-3 bg-white border-2 border-green-100 text-green-700 font-bold rounded-2xl hover:bg-green-50 transition-all shadow-sm active:scale-95">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-gray-300 group-focus-within:text-green-500 transition-all duration-300">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search locally by Name or Branch..."
          className="w-full pl-16 pr-6 py-4 border-2 border-gray-100 rounded-3xl outline-none focus:border-green-500 text-sm font-semibold placeholder:text-gray-300"
        />
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-visible relative">
        <div className="overflow-x-auto rounded-[2rem]">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black">
                <th className="px-6 py-3 whitespace-nowrap">ID</th>
                <th className="px-6 py-3 whitespace-nowrap">Student Details</th>
                <th className="px-6 py-3 whitespace-nowrap">Branch</th>
                <th className="px-6 py-3 whitespace-nowrap text-center">CGPA</th>
                <th className="px-6 py-3 whitespace-nowrap text-center">Applications</th>
                <th className="px-6 py-3 whitespace-nowrap">Status</th>
                <th className="px-6 py-3 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto text-green-500 mb-2"/>Loading students...</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">No students found.</td></tr>
              ) : (
                filteredStudents.map((student) => {
                  const isPlaced = student.status === 'Selected' || student.placed_status === 'Placed';
                  return (
                    <tr key={student.id} className="hover:bg-green-50/40 transition-all duration-200 group relative">
                      <td className="px-6 py-3 text-[11px] font-bold text-gray-400 font-mono uppercase whitespace-nowrap">{student.id}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-200 shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm uppercase">{student.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-xl text-[10px] font-bold border border-gray-200/50">{student.branch || '-'}</span>
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-bold text-xs">
                          <GraduationCap className="w-3.5 h-3.5" />{student.cgpa || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center whitespace-nowrap font-bold text-gray-700">{student.applicationsCount || 0}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-2 border ${
                          isPlaced ? "bg-green-500 text-white border-green-600" : student.status === 'Rejected' ? "bg-red-500 text-white border-red-600" : "bg-orange-100 text-orange-700 border-orange-200"
                        }`}>
                          {student.status || 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right relative whitespace-nowrap">
                        <button onClick={() => toggleMenu(student.id)} className="p-1.5 rounded-xl text-gray-500 hover:bg-green-50">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {activeMenu === student.id && (
                          <div className="absolute right-8 top-10 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-[100] py-2">
                            {student.status === 'Pending' && (
                              <>
                                <button disabled={actionLoading === student.id} onClick={() => handleAction(student.id, "Approve")} className="w-full px-4 py-2 text-left text-sm font-bold text-green-600 hover:bg-green-50 flex items-center gap-2 disabled:opacity-50">
                                  {actionLoading === student.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4" />} Approve
                                </button>
                                <button disabled={actionLoading === student.id} onClick={() => handleAction(student.id, "Reject")} className="w-full px-4 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50">
                                  {actionLoading === student.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4" />} Reject
                                </button>
                              </>
                            )}
                            <button onClick={() => { setSelectedStudent(student); setIsEditMode(false); setActiveMenu(null); }} className="w-full px-4 py-2 text-left text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            <button onClick={() => { setSelectedStudent(student); setEditForm({ name: student.name, email: student.email, branch: student.branch || '', cgpa: student.cgpa || '', status: student.status || 'Pending', placed_status: student.placed_status || 'Not Placed' }); setIsEditMode(true); setActiveMenu(null); }} className="w-full px-4 py-2 text-left text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-2">
                              <Edit2 className="w-4 h-4" /> Edit
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-500">
            Showing Page {page} of {totalPages === 0 ? 1 : totalPages} ({totalStudents} total students)
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page-1)} className="p-2 border rounded-xl hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5"/></button>
            <button disabled={page >= totalPages} onClick={() => setPage(page+1)} className="p-2 border rounded-xl hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>
      </div>

      {/* View/Edit Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl w-full max-w-lg shadow-2xl">
            <h3 className="text-xl font-bold mb-4">{isEditMode ? "Edit Student" : "Student Details"}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <label className="font-bold text-gray-500 block">Name</label>
                {isEditMode ? (
                  <input 
                    className="w-full border p-2 rounded" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
                ) : (
                  <p className="font-semibold text-lg">{selectedStudent.name}</p>
                )}
              </div>
              <div>
                <label className="font-bold text-gray-500 block">Email</label>
                {isEditMode ? (
                  <input 
                    className="w-full border p-2 rounded" 
                    value={editForm.email} 
                    onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  />
                ) : (
                  <p>{selectedStudent.email}</p>
                )}
              </div>
              <div>
                <label className="font-bold text-gray-500 block">Branch</label>
                {isEditMode ? (
                  <select 
                    className="w-full border p-2 rounded" 
                    value={editForm.branch} 
                    onChange={e => setEditForm({...editForm, branch: e.target.value})}
                  >
                    <option value="CSE">CSE</option>
                    <option value="ECE">ECE</option>
                    <option value="EEE">EEE</option>
                    <option value="IT">IT</option>
                    <option value="MECH">MECH</option>
                  </select>
                ) : (
                  <p>{selectedStudent.branch || "N/A"}</p>
                )}
              </div>
              <div>
                <label className="font-bold text-gray-500 block">CGPA</label>
                {isEditMode ? (
                  <input 
                    type="number" 
                    step="0.01" 
                    className="w-full border p-2 rounded" 
                    value={editForm.cgpa} 
                    onChange={e => setEditForm({...editForm, cgpa: e.target.value})} 
                  />
                ) : (
                  <p>{selectedStudent.cgpa || "N/A"}</p>
                )}
              </div>
              {isEditMode && (
                <>
                  <div>
                    <label className="font-bold text-gray-500 block">Status</label>
                    <select 
                      className="w-full border p-2 rounded" 
                      value={editForm.status} 
                      onChange={e => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Active">Active</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-gray-500 block">Placement Status</label>
                    <select 
                      className="w-full border p-2 rounded" 
                      value={editForm.placed_status} 
                      onChange={e => setEditForm({...editForm, placed_status: e.target.value})}
                    >
                      <option value="Not Placed">Not Placed</option>
                      <option value="Placed">Placed</option>
                    </select>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="px-4 py-2 border rounded-lg font-bold"
              >
                Close
              </button>
              {isEditMode && (
                <button 
                  disabled={actionLoading === selectedStudent.id}
                  onClick={async () => {
                    try {
                      setActionLoading(selectedStudent.id);
                      await updateStudentAdmin(selectedStudent.id, editForm);
                      showNotification("Student profile updated successfully", "success", "admin");
                      setSelectedStudent(null);
                      fetchStudents();
                    } catch (err) {
                      showNotification("Failed to update student", "error", "admin");
                    } finally {
                      setActionLoading(null);
                    }
                  }} 
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-bold flex items-center gap-2"
                >
                  {actionLoading === selectedStudent.id && <Loader2 className="w-4 h-4 animate-spin"/>}
                  Save Changes
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
