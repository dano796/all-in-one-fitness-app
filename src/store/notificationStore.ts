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
  isPersistent?: boolean;
  dismissCondition?: () => Promise<boolean>;
}

interface NotificationState {
  notifications: Notification[];
  toastNotifications: Notification[];
  unreadCount: number;
  sessionId: string | null;
  
  addNotification: (
    title: string,
    message: string,
    type?: NotificationType,
    showAsToast?: boolean,
    category?: string,
    isPersistent?: boolean,
    dismissCondition?: () => Promise<boolean>
  ) => void;
  
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
  setSessionId: (sessionId: string | null) => void;
  checkAndDismissNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  toastNotifications: [],
  unreadCount: 0,
  sessionId: null,

  setSessionId: (sessionId: string | null) => {
    if (get().sessionId !== sessionId) {
      set({ sessionId });
      if (!sessionId) {
        get().clearAll();
      }
    }
  },

  addNotification: (
    title, 
    message, 
    type = "info", 
    showAsToast = true, 
    category = "",
    isPersistent = false,
    dismissCondition
  ) => {
    
    const existingNotification = get().notifications.find(
      n => n.title === title && n.message === message && n.type === type
    );

    if (existingNotification) {
      return;
    }

    const notification: Notification = {
      id: uuidv4(),
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      showAsToast,
      category,
      isPersistent,
      dismissCondition
    };

    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));

    if (showAsToast && !isPersistent) {
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

  checkAndDismissNotification: async (id: string) => {
    const notification = get().notifications.find(n => n.id === id);
    if (notification?.dismissCondition) {
      const canDismiss = await notification.dismissCondition();
      if (canDismiss) {
        get().removeNotification(id);
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