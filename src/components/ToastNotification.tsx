import React, { useEffect, useState } from 'react';
import { Notification } from '../store/notificationStore';
import { X, Droplet, Dumbbell, Apple, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useTheme } from '../pages/ThemeContext';

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  index?: number;
  total?: number;
}

const ToastNotification: React.FC<ToastProps> = ({ notification, onClose, index = 0, total = 1 }) => {
  const { title, message, type, category } = notification;
  const { isDarkMode } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {

    setTimeout(() => setIsVisible(true), 100 + index * 100);
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 500);
    }, 5000 + index * 300);
    
    return () => clearTimeout(timer);
  }, [onClose, index]);

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return isDarkMode ? 'bg-green-900/90' : 'bg-green-100';
      case 'error':
        return isDarkMode ? 'bg-red-900/90' : 'bg-red-100';
      case 'warning':
        return isDarkMode ? 'bg-yellow-900/90' : 'bg-yellow-100';
      default:
        return isDarkMode ? 'bg-blue-900/90' : 'bg-blue-100';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      default:
        return 'border-blue-500';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return isDarkMode ? 'text-green-200' : 'text-green-800';
      case 'error':
        return isDarkMode ? 'text-red-200' : 'text-red-800';
      case 'warning':
        return isDarkMode ? 'text-yellow-200' : 'text-yellow-800';
      default:
        return isDarkMode ? 'text-blue-200' : 'text-blue-800';
    }
  };

  // Determinar qué icono mostrar basado en la categoría o tipo
  const getNotificationIcon = () => {

    if (category) {
      switch (category.toLowerCase()) {
        case 'water':
        case 'agua':
          return <Droplet size={20} className="mx-auto" />;
        case 'exercise':
        case 'ejercicio':
          return <Dumbbell size={20} className="mx-auto my-auto" />;
        case 'food':
        case 'comida':
        case 'alimento':
          return <Apple size={20} className="mx-auto" />;
        default:
          break;
      }
    }
    
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="mx-auto" />;
      case 'error':
        return <AlertCircle size={20} className="mx-auto" />;
      case 'warning':
        return <AlertTriangle size={20} className="mx-auto" />;
      default:
        return <Info size={20} className="mx-auto" />;
    }
  };

  return (
    <div 
      className={`w-full md:w-96 shadow-lg rounded-lg border-l-4 mb-1
        ${getBgColor()} ${getBorderColor()} 
        transition-all duration-500`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible 
          ? `translateX(0) translateY(0)` 
          : `translateX(100%) translateY(0)`,
        maxWidth: '90vw',
        zIndex: 1000 - index,
      }}
    >
      <div className="relative p-4">
        <div className="flex items-start">
          <div className={`flex items-center justify-center h-10 w-10 ${getTextColor()}`}>
            {getNotificationIcon()}
          </div>
          <div className="flex-grow pl-2 pr-6">
            <h3 className={`text-sm font-bold ${getTextColor()}`}>{title}</h3>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {message}
            </p>
          </div>
          <button 
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 500);
            }}
            className="text-gray-500 hover:text-gray-700 transition-colors absolute top-3 right-3"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;