import React from 'react';

/**
 * PendingApproval - shown when a user's account is pending admin review.
 */
export default function PendingApproval({ role = 'student', onLogout }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4 font-['Poppins']">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center border border-gray-100">

        {/* Animated Clock Icon */}
        <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6 shadow-sm border-2 border-amber-100">
          <svg className="w-10 h-10 text-amber-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-amber-600 text-[11px] font-extrabold uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Pending Approval
        </div>
        <h1 className="text-2xl font-extrabold text-[#052c42] mb-3 leading-tight">
          Your account is under review
        </h1>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-2">
          A Placement Administrator will manually review and approve your{' '}
          <span className="font-semibold text-[#052c42] capitalize">{role}</span> account.
        </p>
        <p className="text-xs text-gray-400 mb-8">
          This usually takes 1–2 business days. You will be able to log in once approved.
        </p>

        {/* Steps */}
        <div className="text-left space-y-3 bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
          {[
            { step: '1', label: 'Account registered', done: true },
            { step: '2', label: 'Pending admin approval', done: false, active: true },
            { step: '3', label: 'Access granted', done: false },
          ].map(({ step, label, done, active }) => (
            <div key={step} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                done ? 'bg-green-100 text-green-600' :
                active ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-300 ring-offset-1' :
                'bg-gray-100 text-gray-400'
              }`}>
                {done ? '✓' : step}
              </div>
              <span className={`text-sm font-semibold ${done ? 'text-green-600' : active ? 'text-amber-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full py-3 rounded-2xl bg-[#346b41] text-white text-sm font-extrabold tracking-wide hover:bg-[#2a5534] transition-colors"
          >
            Check Again
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-3 rounded-2xl bg-red-50 text-red-600 text-sm font-extrabold tracking-wide border border-red-100 hover:bg-red-100 transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
