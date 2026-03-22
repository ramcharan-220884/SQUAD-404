import React, { useRef } from 'react';

import { useNotification } from '../context/NotificationContext';

const UploadSection = ({ type, file, onUpload }) => {
  const inputRef = useRef();
  const { showNotification } = useNotification();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (type === 'resume' && selectedFile.type !== 'application/pdf') {
        showNotification('Please upload a PDF file only.', 'error', 'student');
        return;
      }
      onUpload(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
        {type === 'photo' ? '1. Profile Photo' : '2. Resume (PDF Only)'}
      </label>
      
      <div 
        onClick={() => inputRef.current.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${
          file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-[#800000] hover:bg-maroon-50'
        } ${type === 'photo' ? 'w-48 h-48 mx-auto rounded-full' : 'w-full h-48'}`}
      >
        <input 
          type="file" 
          ref={inputRef} 
          className="hidden" 
          accept={type === 'photo' ? 'image/*' : '.pdf'}
          onChange={handleFileChange}
        />
        
        {!file ? (
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#800000] group-hover:text-white transition-colors text-gray-400">
              {type === 'photo' ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              )}
            </div>
            <p className="text-xs font-bold text-gray-500 group-hover:text-[#800000] transition-colors">
              {type === 'photo' ? 'Upload Photo' : 'Click or Drag & Drop Resume'}
            </p>
            {type === 'resume' && <p className="text-[10px] text-gray-400 mt-1">PDF Only (Max 5MB)</p>}
          </div>
        ) : (
          <div className="text-center p-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-xs font-bold text-green-700 truncate max-w-[150px] mx-auto">{file.name}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); onUpload(null); }}
              className="mt-2 text-[10px] font-bold text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        )}

        {/* Preview for photo */}
        {file && type === 'photo' && (
          <img 
            src={file.url} 
            alt="Preview" 
            className="absolute inset-0 w-full h-full object-cover rounded-full pointer-events-none opacity-20"
          />
        )}
      </div>
      
      <style jsx="true">{`
        .hover-bg-maroon-50:hover {
          background-color: rgba(128, 0, 0, 0.02);
        }
      `}</style>
    </div>
  );
};

export default UploadSection;
