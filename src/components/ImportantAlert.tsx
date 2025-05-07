import React from "react";
import { X } from "lucide-react";
import { useNotificationStore } from "../store/notificationStore";
import { useTheme } from "../pages/ThemeContext";
import { useNavigate } from "react-router-dom";

const ImportantAlert: React.FC = () => {
  const { notifications, removeNotification, checkAndDismissNotification } = useNotificationStore();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const importantNotification = notifications.find(n => n.isPersistent);

  const getBgColor = (type: string) => {
    switch (type) {
      case "success":
        return isDarkMode 
          ? "bg-green-900/90" 
          : "bg-green-100";
      case "warning":
        return isDarkMode 
          ? "bg-yellow-900/90" 
          : "bg-yellow-100";
      case "error":
        return isDarkMode 
          ? "bg-red-900/90" 
          : "bg-red-100";
      default:
        return isDarkMode 
          ? "bg-blue-900/90" 
          : "bg-blue-100";
    }
  };

  const getTextColor = (type: string) => {
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

  const handleClick = (notification: any) => {
    if (notification.category === 'calorie-goal') {
      navigate('/calorie-calculator');
      checkAndDismissNotification(notification.id);
    }
  };

  if (!importantNotification) return null;

  return (
    <div className="fixed top-0 left-10 right-0 z-50 px-2 py-2 pointer-events-none">
      <div 
        onClick={() => handleClick(importantNotification)}
        className={`ml-16 max-w-lg rounded-lg shadow-lg transition-all duration-300 pointer-events-auto
          ${getBgColor(importantNotification.type)} 
          ${importantNotification.category === 'calorie-goal' ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
      >
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-medium ${getTextColor(importantNotification.type)}`}>
              {importantNotification.title}
            </span>
            <span className={`text-sm ${getTextColor(importantNotification.type)}`}>
              {importantNotification.message}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              checkAndDismissNotification(importantNotification.id);
            }}
            className={`${getTextColor(importantNotification.type)} hover:opacity-75 transition-opacity flex-shrink-0`}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportantAlert;