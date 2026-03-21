import React from 'react';

/**
 * EmptyState — reusable empty state component.
 *
 * Usage:
 *   <EmptyState icon="📋" title="No jobs found" subtitle="Check back later for new opportunities." />
 *   <EmptyState icon="🔔" title="No announcements" action={{ label: "Refresh", onClick: fetchData }} />
 */
export default function EmptyState({
  icon = '📭',
  title = 'Nothing here yet',
  subtitle = '',
  action = null,
  compact = false,
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center w-full ${compact ? 'py-8 px-4' : 'py-16 px-6'}`}>
      <div className={`${compact ? 'text-4xl mb-3' : 'text-6xl mb-5'}`}>{icon}</div>
      <h3 className={`font-bold text-gray-700 ${compact ? 'text-sm mb-1' : 'text-lg mb-2'}`}>{title}</h3>
      {subtitle && (
        <p className={`text-gray-400 font-medium ${compact ? 'text-xs' : 'text-sm'} max-w-xs`}>{subtitle}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-5 px-5 py-2.5 bg-[#346b41] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl hover:bg-[#2a5534] transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
