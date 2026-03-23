import React, { useState, useEffect } from "react";
import { getAllCompanies, approveUser, rejectUser, updateCompanyAdmin } from "../../services/adminService";
import { useNotification } from "../../context/NotificationContext";
import {
  Download, MoreVertical, Building,
  Users, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Eye, Edit2, Loader2,
  Sun, Moon
} from "lucide-react";

export default function CompanyManagement() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalCompanies, setTotalCompanies] = useState(0);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', status: '', package: '', deadline: '' });

  const [isDark, setIsDark] = useState(false);

  const { showNotification } = useNotification();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getAllCompanies(page, limit);
      const data = res.data || res;
      setCompanies(data);
      
      const total = res.pagination?.total || data.length;
      setTotalCompanies(total);

      const activeDrives = data.filter(c => c.status === 'Active').length;
      const totalApplications = data.reduce((acc, c) => acc + (c.totalApplications || 0), 0);
      const studentsSelected = data.reduce((acc, c) => acc + (c.studentsSelected || 0), 0);

      setStats([
        { title: "Total Companies", value: String(total), icon: Building, color: "text-emerald-700", bg: "bg-emerald-50" },
        { title: "Active Drives", value: String(activeDrives), icon: Clock, color: "text-emerald-700", bg: "border-emerald-100" },
        { title: "Students Applied", value: String(totalApplications), icon: Users, color: "text-emerald-700", bg: "bg-emerald-50" },
        { title: "Students Selected", value: String(studentsSelected), icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50" },
      ]);
    } catch (err) {
      console.error("Error fetching companies:", err);
      showNotification("Failed to fetch companies", "error", "admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleAction = async (id, action) => {
    try {
      setActionLoading(id);
      if (action === "Approve") {
        await approveUser(id, "company");
      } else if (action === "Reject" || action === "Delete") {
        await rejectUser(id, "company");
      }
      showNotification(`Company ${action === 'Approve' ? 'Approved' : 'Processed'} successfully`, "success", "admin");
      setActiveMenu(null);
      fetchCompanies();
    } catch (err) {
      console.error(`Failed to ${action} company`, err);
      showNotification(`Failed to ${action} company`, "error", "admin");
    } finally {
      setActionLoading(null);
    }
  };

  const exportToCSV = () => {
    if (companies.length === 0) return;
    const headers = ["ID", "Name", "Email", "Role", "Status", "Total Jobs", "Total Applications", "Selected"];
    const csvRows = [headers.join(",")];
    
    companies.forEach(c => {
      const row = [
        c.id, `"${c.name}"`, `"${c.email}"`, `"${c.role || '-'}"`, 
        c.status || "Pending", c.totalJobs || 0, c.totalApplications || 0, c.studentsSelected || 0
      ];
      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "companies_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalPages = Math.ceil(totalCompanies / limit);
  const filteredCompanies = companies.filter(c => c.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto ${isDark ? "feature-dark rounded-3xl p-6" : ""}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Company Management</h2>
        <button 
          onClick={() => setIsDark(prev => !prev)} 
          className={`theme-btn ${isDark ? 'dark' : 'light'}`}
        >
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          <span>{isDark ? "Dark" : "Light"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 relative">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} ${stat.bg}`}>
               <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-500 mb-1">{stat.title}</p>
              <h4 className="text-2xl font-black text-gray-900 leading-none">{stat.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search locally by company name..."
            className="w-full pl-6 pr-6 py-3.5 bg-white border-2 border-gray-100 rounded-2xl outline-none focus:border-emerald-500/50 text-sm font-medium"
          />
        </div>
        <button onClick={exportToCSV} className="px-6 py-3.5 bg-emerald-800 text-white font-bold rounded-2xl hover:bg-emerald-900 transition-all shadow-md flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-400 text-[11px] uppercase tracking-wider font-bold border-b border-gray-50">
                <th className="px-6 py-5 font-bold">Company</th>
                <th className="px-6 py-5 font-bold">Email</th>
                <th className="px-6 py-5 font-bold text-center">Jobs Posted</th>
                <th className="px-6 py-5 font-bold text-center">Applications</th>
                <th className="px-6 py-5 font-bold text-center">Selected</th>
                <th className="px-6 py-5 font-bold text-center">Status</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2"/>Loading companies...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-gray-400 font-medium">No companies found.</td></tr>
              ) : (
                filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50/50 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-700 font-black text-sm border border-emerald-100">
                          {(company.name || 'CO').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{company.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-[12px] font-bold text-gray-500">{company.email}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-[12px] font-bold text-gray-700">{company.totalJobs || 0}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-[12px] font-bold text-gray-700">{company.totalApplications || 0}</span></td>
                    <td className="px-6 py-4 text-center"><span className="text-[12px] font-bold text-emerald-700">{company.studentsSelected || 0}</span></td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-bold ${
                        company.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" : company.status === 'Rejected' ? "bg-red-50 text-red-700 border-red-100" : "bg-orange-100 text-orange-700 border-orange-200"
                      }`}>
                        {company.status || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <button onClick={(e) => setActiveMenu(activeMenu === company.id ? null : company.id)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {activeMenu === company.id && (
                        <div className="absolute right-8 top-12 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 py-2">
                          {company.status === 'Pending' && (
                            <>
                              <button disabled={actionLoading===company.id} onClick={() => handleAction(company.id, "Approve")} className="w-full px-4 py-2.5 text-left text-xs font-bold text-green-600 hover:bg-green-50 flex items-center gap-3 disabled:opacity-50">
                                {actionLoading===company.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle className="w-4 h-4" />} Approve
                              </button>
                              <button disabled={actionLoading===company.id} onClick={() => handleAction(company.id, "Reject")} className="w-full px-4 py-2.5 text-left text-xs font-bold text-orange-600 hover:bg-orange-50 flex items-center gap-3 disabled:opacity-50">
                                {actionLoading===company.id ? <Loader2 className="w-4 h-4 animate-spin"/> : <XCircle className="w-4 h-4" />} Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => { setSelectedCompany(company); setIsEditMode(false); setActiveMenu(null); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                            <Eye className="w-4 h-4" /> View Details
                          </button>
                          <button onClick={() => { 
                            setSelectedCompany(company); 
                            setEditForm({ 
                              name: company.name, 
                              email: company.email, 
                              status: company.status || 'Pending', 
                              package: company.package || '', 
                              deadline: company.deadline ? new Date(company.deadline).toISOString().split('T')[0] : '' 
                            }); 
                            setIsEditMode(true); 
                            setActiveMenu(null); 
                          }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3">
                            <Edit2 className="w-4 h-4" /> Edit
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
          <p className="text-sm font-bold text-gray-500">
            Showing Page {page} of {totalPages === 0 ? 1 : totalPages} ({totalCompanies} total companies)
          </p>
          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage(page-1)} className="p-2 border rounded-xl hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5"/></button>
            <button disabled={page >= totalPages} onClick={() => setPage(page+1)} className="p-2 border rounded-xl hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5"/></button>
          </div>
        </div>
      </div>

      {/* View/Edit Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/50 z-[200] flex justify-center items-center p-4">
          <div className="bg-white p-5 rounded-2xl w-full max-w-md shadow-2xl border dark:bg-slate-900 dark:border-slate-800">
            <h3 className="text-xl font-black mb-3 uppercase tracking-tight text-gray-900 dark:text-white">{isEditMode ? "Edit Company" : "Company Details"}</h3>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Company Name</label>
                {isEditMode ? (
                  <input 
                    className="w-full border-2 border-gray-100 dark:border-slate-800 p-1.5 rounded-xl outline-none focus:border-emerald-500 transition-all dark:bg-slate-800 dark:text-white font-bold" 
                    value={editForm.name} 
                    onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  />
                ) : (
                  <p className="font-bold text-gray-900 dark:text-gray-100">{selectedCompany.name}</p>
                )}
              </div>
              <div>
                <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                {isEditMode ? (
                  <input 
                    className="w-full border-2 border-gray-100 dark:border-slate-800 p-1.5 rounded-xl outline-none focus:border-emerald-500 transition-all dark:bg-slate-800 dark:text-white font-bold" 
                    value={editForm.email} 
                    onChange={e => setEditForm({...editForm, email: e.target.value})} 
                  />
                ) : (
                  <p className="font-bold text-gray-900 dark:text-gray-100">{selectedCompany.email}</p>
                )}
              </div>
              <div className="flex gap-3">
                <div className="w-1/2">
                    <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Package</label>
                    {isEditMode ? (
                    <input 
                        className="w-full border-2 border-gray-100 dark:border-slate-800 p-1.5 rounded-xl outline-none focus:border-emerald-500 transition-all dark:bg-slate-800 dark:text-white font-bold" 
                        value={editForm.package} 
                        onChange={e => setEditForm({...editForm, package: e.target.value})} 
                    />
                    ) : (
                    <p className="font-bold text-gray-900 dark:text-gray-100">{selectedCompany.package || "N/A"}</p>
                    )}
                </div>
                <div className="w-1/2">
                    <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Deadline</label>
                    {isEditMode ? (
                    <input 
                        type="date"
                        className="w-full border-2 border-gray-100 dark:border-slate-800 p-1.5 rounded-xl outline-none focus:border-emerald-500 transition-all dark:bg-slate-800 dark:text-white font-bold" 
                        value={editForm.deadline} 
                        onChange={e => setEditForm({...editForm, deadline: e.target.value})} 
                    />
                    ) : (
                    <p className="font-bold text-gray-900 dark:text-gray-100">{selectedCompany.deadline ? new Date(selectedCompany.deadline).toLocaleDateString() : "N/A"}</p>
                    )}
                </div>
              </div>
              <div>
                <label className="font-black text-[10px] text-gray-400 uppercase tracking-widest block mb-1">Status</label>
                {isEditMode ? (
                  <select 
                    className="w-full border-2 border-gray-100 dark:border-slate-800 p-1.5 rounded-xl outline-none focus:border-emerald-500 transition-all dark:bg-slate-800 dark:text-white font-bold" 
                    value={editForm.status} 
                    onChange={e => setEditForm({...editForm, status: e.target.value})}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Active">Active</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                ) : (
                  <p className={`font-bold ${selectedCompany.status === 'Active' ? 'text-emerald-600' : 'text-orange-600'}`}>{selectedCompany.status || "Pending"}</p>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2.5">
              <button onClick={() => setSelectedCompany(null)} className="px-4 py-2 border rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all text-xs">Close</button>
              {isEditMode && (
                <button 
                  disabled={actionLoading === selectedCompany.id}
                  onClick={async () => {
                    try {
                      setActionLoading(selectedCompany.id);
                      await updateCompanyAdmin(selectedCompany.id, editForm);
                      showNotification("Company updated successfully", "success", "admin");
                      setSelectedCompany(null);
                      fetchCompanies();
                    } catch (err) {
                      showNotification("Failed to update company", "error", "admin");
                    } finally {
                      setActionLoading(null);
                    }
                  }} 
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 transition-all shadow-lg text-xs"
                >
                  {actionLoading === selectedCompany.id && <Loader2 className="w-3.5 h-3.5 animate-spin"/>}
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
