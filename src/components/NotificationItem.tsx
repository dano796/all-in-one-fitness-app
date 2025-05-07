import React, { useEffect } from "react";
import { Notification, useNotificationStore } from "../store/notificationStore";
import { X } from "lucide-react";
import { useTheme } from "../pages/ThemeContext";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { removeNotification, markAsRead, checkAndDismissNotification } = useNotificationStore();
  const { id, title, message, type, isRead, category } = notification;
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  
  const formattedDate = new Date(notification.createdAt).toLocaleTimeString();
  
  useEffect(() => {
    if (!isRead) {
      const timer = setTimeout(() => {
        markAsRead(id);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [id, isRead, markAsRead]);

  const handleClick = () => {
    if (category === 'calorie-goal') {
      navigate('/calorie-calculator');
      checkAndDismissNotification(id);
    }
  };
  
  const getBgColor = () => {
    switch (type) {
      case "success":
        return isDarkMode 
          ? "bg-green-900/60 border-green-600" 
          : "bg-green-100 border-green-400";
      case "warning":
        return isDarkMode 
          ? "bg-yellow-900/60 border-yellow-600" 
          : "bg-yellow-100 border-yellow-400";
      case "error":
        return isDarkMode 
          ? "bg-red-900/60 border-red-600" 
          : "bg-red-100 border-red-400";
      default:
        return isDarkMode 
          ? "bg-blue-900/60 border-blue-600" 
          : "bg-blue-100 border-blue-400";
    }
  };
  
  const getTextColor = () => {
    switch (type) {
      case "success":
        return isDarkMode ? "text-green-200" : "text-green-800";
      case "warning":
        return isDarkMode ? "text-yellow-200" : "text-yellow-800";
      case "error":
        return isDarkMode ? "text-red-200" : "text-red-800";
      default:
        return isDarkMode ? "text-blue-200" : "text-blue-800";
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative p-4 mb-4 border rounded-lg shadow-sm transition-all duration-300 ${getBgColor()} ${category === 'calorie-goal' ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className={`font-semibold mb-1 ${getTextColor()}`}>{title}</h4>
          <p className={`text-sm ${getTextColor()}`}>{message}</p>
          <span className={`text-xs mt-2 block opacity-60 ${getTextColor()}`}>
            {formattedDate}
          </span>
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