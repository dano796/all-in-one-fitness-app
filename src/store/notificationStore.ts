import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export type NotificationType = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  showAsToast?: boolean;
  category?: string;
}

interface NotificationState {
  notifications: Notification[];
  toastNotifications: Notification[];
  unreadCount: number;
  
  addNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    showAsToast?: boolean,
    category?: string
  ) => void;
  
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  toastNotifications: [],
  unreadCount: 0,

  addNotification: (title, message, type = "info", showAsToast = true, category = "") => {
    console.log(`[DEBUG] Añadiendo notificación: ${title} - ${message} - ${type} - showAsToast: ${showAsToast} - category: ${category}`);
    
    const notification: Notification = {
      id: uuidv4(),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      showAsToast,
      category,
    };

    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    if (showAsToast) {
      set((state) => ({
        toastNotifications: [...state.toastNotifications, notification],
      }));
      
      if (type !== "error") {
        setTimeout(() => {
          get().removeToast(notification.id);
        }, 6000);
      }
    }
  },

  markAsRead: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        return {
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: state.unreadCount - 1,
        };
      }
      return state;
    });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  removeNotification: (id) => {
    set((state) => {
      const notification = state.notifications.find((n) => n.id === id);
      return {
        notifications: state.notifications.filter((n) => n.id !== id),
        unreadCount: notification && !notification.isRead 
          ? state.unreadCount - 1 
          : state.unreadCount,
      };
    });
  },

  removeToast: (id) => {
    set((state) => ({
      toastNotifications: state.toastNotifications.filter((n) => n.id !== id),
    }));
  },

  clearAll: () => {
    set({ 
      notifications: [], 
      toastNotifications: [],
      unreadCount: 0 
    });
  },
}));