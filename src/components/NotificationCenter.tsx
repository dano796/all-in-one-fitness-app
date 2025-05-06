import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotificationStore } from "../store/notificationStore";
import NotificationItem from "./NotificationItem";
import { useTheme } from "../pages/ThemeContext";

const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotificationStore();
  const notificationRef = useRef<HTMLDivElement>(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current && 
        !notificationRef.current.contains(event.target as Node) && 
        isOpen
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      <button
        onClick={toggleNotifications}
        className={`relative p-2 ${unreadCount > 0 ? 'text-[#ff9404]' : 'text-gray-600'} hover:text-[#ff9404] transition-colors`}
        aria-label="Notificaciones"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-80 ${isDarkMode ? 'bg-[#282c3c] border-[#3B4252]' : 'bg-white border-gray-300'} border rounded-md shadow-lg z-50`}>
          <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-[#3B4252]' : 'border-gray-300'}`}>
            <h3 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Notificaciones</h3>
            {notifications.length > 0 && (
              <button 
                onClick={clearAll}
                className="text-xs text-[#ff9404] hover:text-[#e08503]"
              >
                Borrar todo
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto p-4">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))
            ) : (
              <p className={`text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} py-4`}>No hay notificaciones</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;