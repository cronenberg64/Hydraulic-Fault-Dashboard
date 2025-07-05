
import { useState, useCallback } from 'react';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: number;
  persistent?: boolean;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((
    type: Notification['type'],
    title: string,
    message: string,
    persistent = false
  ) => {
    // Prevent duplicate notifications with the same title and message
    setNotifications(prev => {
      const exists = prev.some(n => n.title === title && n.message === message);
      if (exists) return prev;
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        title,
        message,
        timestamp: Date.now(),
        persistent
      };
      return [...prev, notification];
    });
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    addNotification,
    dismissNotification,
    clearAllNotifications
  };
};
