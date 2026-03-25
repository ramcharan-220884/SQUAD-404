import React, { useEffect, useState } from 'react';
import { getMySubmissions } from '../../services/studentService';
import { Loader2, Plus, FileText, Calendar, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MySubmissionsModal({ onClose }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getMySubmissions();
      setSubmissions(data || []);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    if (type === 'event') return <Calendar className="w-5 h-5 text-blue-500" />;
    if (type === 'competition') return <Trophy className="w-5 h-5 text-orange-500" />;
    return <FileText className="w-5 h-5 text-purple-500" />;
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-green-200"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
    if (status === 'rejected') return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Rejected</span>;
    return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border border-blue-200"><Clock className="w-3.5 h-3.5" /> Pending</span>;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[300] flex justify-center items-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-800 p-8 border-b dark:border-slate-700 relative">
          <button onClick={onClose} className="absolute top-8 right-8 p-2 bg-slate-200 dark:bg-slate-700 rounded-full hover:bg-slate-300 dark:hover:bg-slate-600 transition-all">
            <Plus className="w-6 h-6 rotate-45 text-slate-700 dark:text-slate-300" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Submissions</h2>
              <p className="text-slate-500 font-medium">Track the approval status of your community contributions.</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-8 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/50 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
              <p className="font-bold">Loading your submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Submissions Yet</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                You haven't submitted any resources, events, or competitions for the community. Use the dashboard to share knowledge!
              </p>
            </div>
          ) : (
            <div className="grid gap-4 w-full">
              {submissions.map((sub, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 shrink-0">
                      {getIcon(sub.category_type || sub.type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-1">{sub.title}</h4>
                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                         <span className="uppercase tracking-wider">{sub.category_type || sub.type}</span>
                         <span>•</span>
                         <span>Submitted {new Date(sub.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(sub.status || 'pending')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
