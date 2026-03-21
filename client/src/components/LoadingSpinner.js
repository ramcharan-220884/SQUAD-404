import React from 'react';

/**
 * LoadingSpinner — reusable loading indicator.
 *
 * Usage:
 *   <LoadingSpinner />                      // full screen
 *   <LoadingSpinner inline />               // inline (fits container)
 *   <LoadingSpinner size="sm" label="..." /> // small with custom label
 */
export default function LoadingSpinner({ inline = false, size = 'md', label = 'Loading...' }) {
  const sizes = { sm: 'h-6 w-6 border-2', md: 'h-10 w-10 border-[3px]', lg: 'h-16 w-16 border-4' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`animate-spin rounded-full border-gray-200 border-t-[#346b41] ${sizes[size]}`} />
      {label && <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{label}</p>}
    </div>
  );

  if (inline) return <div className="flex items-center justify-center w-full py-10">{spinner}</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      {spinner}
    </div>
  );
}

/**
 * SkeletonCard — shimmer placeholder for card grids.
 */
export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm animate-pulse">
      <div className="h-4 bg-gray-100 rounded-full w-2/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-gray-100 rounded-full mb-2 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
      <div className="h-8 bg-gray-100 rounded-xl w-1/3 mt-4" />
    </div>
  );
}
