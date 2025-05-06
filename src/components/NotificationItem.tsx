import React, { useEffect } from "react";
import { Notification, useNotificationStore } from "../store/notificationStore";
import { X } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { removeNotification, markAsRead } = useNotificationStore();
  const { id, title, message, type, isRead } = notification;
  const { isDarkMode } = useTheme();
  
  const formattedDate = new Date(notification.createdAt).toLocaleTimeString();
  
  useEffect(() => {
    if (!isRead) {
      const timer = setTimeout(() => {
        markAsRead(id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [id, isRead, markAsRead]);
  
  const getBgColor = () => {
    switch (type) {
      case "success":
        return isDarkMode 
          ? "bg-green-900/60 border-green-600" 
          : "bg-green-100 border-green-500";
      case "error":
        return isDarkMode 
          ? "bg-red-900/60 border-red-600" 
          : "bg-red-100 border-red-500";
      case "warning":
        return isDarkMode 
          ? "bg-yellow-900/60 border-yellow-600" 
          : "bg-yellow-100 border-yellow-500";
      default:
        return isDarkMode 
          ? "bg-blue-900/60 border-blue-600" 
          : "bg-blue-100 border-blue-500";
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case "success":
        return isDarkMode ? "text-green-300" : "text-green-700";
      case "error":
        return isDarkMode ? "text-red-300" : "text-red-700";
      case "warning":
        return isDarkMode ? "text-yellow-300" : "text-yellow-700";
      default:
        return isDarkMode ? "text-blue-300" : "text-blue-700";
    }
  };

  const handleClick = () => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  const enterAnimation = !isRead ? "animate-fadeIn" : "";

  return (
    <div 
      className={`relative p-4 mb-3 rounded-md shadow-md border-l-4 ${getBgColor()} ${!isRead ? 'font-medium transform transition-all' : 'opacity-80'} ${enterAnimation}`} 
      onClick={handleClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`text-sm font-bold ${getTextColor()}`}>{title}</h3>
          <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{message}</p>
          <span className="text-xs text-gray-500 mt-2 inline-block">{formattedDate}</span>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            removeNotification(id);
          }} 
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
      
      {!isRead && (
        <span className="absolute top-2 right-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse"></span>
      )}
    </div>
  );
};

export default NotificationItem;