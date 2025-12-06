import { useNotificationContext } from '@/context/NotificationContext';

export const useNotification = () => {
  const context = useNotificationContext();
  
  return {
    notify: context.addNotification,
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    clearAll: context.clearNotifications
  };
};