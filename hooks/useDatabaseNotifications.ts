/**
 * React Hook: useDatabaseNotifications
 * Fetch notifications from database API (works across different origins/devices)
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';

interface DatabaseNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  bookingId?: number | null;
  clientId?: number | null;
  createdAt: string;
}

interface UseDatabaseNotificationsOptions {
  intervalMs?: number; // Poll interval in milliseconds (default: 10000 = 10 seconds)
  enabled?: boolean; // Enable/disable auto-polling (default: true)
  showToast?: boolean; // Show toast notifications (default: true)
}

export function useDatabaseNotifications(options: UseDatabaseNotificationsOptions = {}) {
  const {
    intervalMs = 10000, // Poll every 10 seconds
    enabled = true,
    showToast = true,
  } = options;

  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/notifications');

      if (!response.ok) {
        console.error('Failed to fetch notifications:', response.statusText);
        return;
      }

      const data = await response.json();
      const notifs = data.notifications || [];
      const prevCount = notifications.length;
      const currentCount = notifs.length;

      // Show toast for new notifications
      if (showToast && currentCount > prevCount && prevCount > 0) {
        const newNotifs = notifs.slice(0, currentCount - prevCount);
        newNotifs.forEach((notif: DatabaseNotification) => {
          if (!notif.read) {
            toast.info(notif.message, {
              duration: 5000,
              action: {
                label: 'View',
                onClick: () => {
                  if (notif.link) {
                    window.location.href = notif.link;
                  }
                },
              },
            });
          }
        });
      }

      setNotifications(notifs);
      setUnreadCount(data.unreadCount || 0);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [notifications.length, showToast]);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds: [notificationId] }),
      });

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [fetchNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAll: true }),
      });

      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [fetchNotifications]);

  // Auto-polling
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    fetchNotifications();

    // Set up interval
    const intervalId = setInterval(() => {
      fetchNotifications();
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, intervalMs, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    lastCheck,
    isLoading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };
}
