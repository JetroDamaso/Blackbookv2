/**
 * React Hook: useNotifications
 * Manage and display real-time notifications (client-side)
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  getLocalNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteLocalNotification,
  getUnreadNotificationCount,
  type LocalNotification,
} from '@/lib/local/storage';
import { checkAllNotifications } from '@/lib/local/notification-checker';
import { toast } from 'sonner';

interface UseNotificationsOptions {
  intervalMs?: number; // Check interval in milliseconds (default: 10000 = 10 seconds)
  enabled?: boolean; // Enable/disable auto-checks (default: true)
  showToast?: boolean; // Show toast notifications (default: true)
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const {
    intervalMs = 10000, // Check every 10 seconds by default
    enabled = true,
    showToast = true,
  } = options;

  const [notifications, setNotifications] = useState<LocalNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Use ref to track previous count without triggering re-renders
  const previousCountRef = useRef(0);

  // Refresh notifications from storage
  const refreshNotifications = useCallback(() => {
    const notifs = getLocalNotifications();
    setNotifications(notifs);
    setUnreadCount(getUnreadNotificationCount());
  }, []);

  // Check for new notifications and show toasts
  const checkNotifications = useCallback(() => {
    // Run notification checks
    checkAllNotifications();

    // Get updated notifications
    const notifs = getLocalNotifications();
    const currentCount = notifs.length;

    // Show toast for new notifications
    if (showToast && currentCount > previousCountRef.current) {
      const newNotifs = notifs.slice(0, currentCount - previousCountRef.current);
      newNotifs.forEach(notif => {
        if (!notif.read) {
          toast.info(notif.message, {
            duration: 5000,
            action: {
              label: 'View',
              onClick: () => {
                // Could trigger a callback or open notification panel
              },
            },
          });
        }
      });
    }

    previousCountRef.current = currentCount;
    setNotifications(notifs);
    setUnreadCount(getUnreadNotificationCount());
    setLastCheck(new Date());
  }, [showToast]);

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    markNotificationAsRead(notificationId);
    refreshNotifications();
  }, [refreshNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    markAllNotificationsAsRead();
    refreshNotifications();
  }, [refreshNotifications]);

  // Delete notification
  const deleteNotification = useCallback((notificationId: string) => {
    deleteLocalNotification(notificationId);
    refreshNotifications();
  }, [refreshNotifications]);

  // Auto-check timer
  useEffect(() => {
    if (!enabled) return;

    // Define check function inside effect to avoid dependency issues
    const performCheck = () => {
      checkAllNotifications();

      const notifs = getLocalNotifications();
      const currentCount = notifs.length;

      // Show toast for new notifications
      if (showToast && currentCount > previousCountRef.current) {
        const newNotifs = notifs.slice(0, currentCount - previousCountRef.current);
        newNotifs.forEach(notif => {
          if (!notif.read) {
            toast.info(notif.message, {
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  // Could trigger a callback or open notification panel
                },
              },
            });
          }
        });
      }

      previousCountRef.current = currentCount;
      setNotifications(notifs);
      setUnreadCount(getUnreadNotificationCount());
      setLastCheck(new Date());
    };

    // Run immediately on mount
    performCheck();

    // Set up interval
    const intervalId = setInterval(() => {
      performCheck();
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, intervalMs, showToast]); // Removed previousCount from deps

  // Listen for cross-tab updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      const notifs = getLocalNotifications();
      setNotifications(notifs);
      setUnreadCount(getUnreadNotificationCount());
    };

    window.addEventListener('notifications-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('notifications-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []); // Empty dependency array - only set up listeners once

  // Initial load
  useEffect(() => {
    const notifs = getLocalNotifications();
    setNotifications(notifs);
    setUnreadCount(getUnreadNotificationCount());
    previousCountRef.current = notifs.length;
  }, []); // Empty dependency array - only run once on mount

  return {
    notifications,
    unreadCount,
    lastCheck,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
    checkNotifications,
  };
}

/**
 * React Hook: useNotificationToasts
 * Simple hook to just show toast notifications without full notification management
 */
export function useNotificationToasts(intervalMs: number = 10000) {
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  useEffect(() => {
    let previousNotifCount = getLocalNotifications().length;

    const checkAndToast = () => {
      checkAllNotifications();

      const currentNotifs = getLocalNotifications();
      const currentCount = currentNotifs.length;

      if (currentCount > previousNotifCount) {
        const newNotifs = currentNotifs.slice(0, currentCount - previousNotifCount);
        newNotifs.forEach(notif => {
          if (!notif.read) {
            toast.info(notif.message, {
              duration: 5000,
            });
          }
        });
      }

      previousNotifCount = currentCount;
      setLastCheck(new Date());
    };

    // Run immediately
    checkAndToast();

    // Set up interval
    const intervalId = setInterval(checkAndToast, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [intervalMs]);

  return { lastCheck };
}
