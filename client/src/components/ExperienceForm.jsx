import React, { useState } from 'react';

const ExperienceForm = ({ onSave, onCancel }) => {
  const [exp, setExp] = useState({
    company: '',
    role: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!exp.company) e.company = 'Required';
    if (!exp.role) e.role = 'Required';
    if (!exp.startDate) e.startDate = 'Required';
    if (!exp.endDate) e.endDate = 'Required';
    if (!exp.description) e.description = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(exp);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-[#800000]/20 space-y-2 animate-fade-in mb-3">
      <h3 className="font-bold text-[#800000] mb-1 flex items-center gap-2 text-sm">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        New Experience
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Company Name</label>
          <input 
            type="text" 
            placeholder="e.g. Google"
            className={`w-full p-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#800000] transition-shadow text-sm ${errors.company ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            value={exp.company}
            onChange={(e) => setExp({...exp, company: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Role / Position</label>
          <input 
            type="text" 
            placeholder="e.g. SDE Intern"
            className={`w-full p-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#800000] transition-shadow text-sm ${errors.role ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            value={exp.role}
            onChange={(e) => setExp({...exp, role: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Start Date</label>
          <input 
            type="date" 
            className={`w-full p-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#800000] transition-shadow text-sm ${errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            value={exp.startDate}
            onChange={(e) => setExp({...exp, startDate: e.target.value})}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">End Date</label>
          <input 
            type="date" 
            className={`w-full p-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#800000] transition-shadow text-sm ${errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            value={exp.endDate}
            onChange={(e) => setExp({...exp, endDate: e.target.value})}
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Description</label>
          <textarea 
            rows="2" 
            placeholder="Tell us about your achievements..."
            className={`w-full p-1.5 border rounded-lg outline-none focus:ring-2 focus:ring-[#800000] transition-shadow text-sm ${errors.description ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
            value={exp.description}
            onChange={(e) => setExp({...exp, description: e.target.value})}
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end pt-1">
        <button onClick={onCancel} className="px-3 py-1.5 text-gray-500 font-bold hover:text-gray-700 transition-colors text-sm">Cancel</button>
        <button onClick={handleSave} className="bg-[#800000] text-white px-5 py-1.5 rounded-lg font-bold hover:bg-[#4a0000] transition-all transform active:scale-95 text-sm">Save Experience</button>
      </div>
    </div>
  );
};

export default ExperienceForm;
