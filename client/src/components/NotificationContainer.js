import React from 'react';
import NotificationCard from './NotificationCard';

const NotificationContainer = ({ notifications, onRemove }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[2000] flex flex-col gap-4 max-w-md w-full pointer-events-none p-4">
      {notifications.map((n) => (
        <NotificationCard 
          key={n.id} 
          {...n} 
          onClose={() => onRemove(n.id)} 
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
