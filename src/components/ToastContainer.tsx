import React from 'react';
import { useNotificationStore } from '../store/notificationStore';
import ToastNotification from './ToastNotification';

const ToastContainer: React.FC = () => {
  const { toastNotifications, removeToast } = useNotificationStore();

  return (
    <div className="fixed top-16 right-4 z-50 flex flex-col items-end gap-3 max-h-[80vh] overflow-hidden pointer-events-none">
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        {toastNotifications.map((notification, index) => (
          <ToastNotification
            key={notification.id}
            notification={notification}
            onClose={() => removeToast(notification.id)}
            index={index}
            total={toastNotifications.length}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;