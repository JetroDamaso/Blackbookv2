/**
 * BookingSystemProvider
 * Global provider that runs status updates and notifications
 * Place this in your root layout
 */

'use client';

import { useEffect } from 'react';
import { useBookingStatusUpdater } from '@/hooks/useBookingStatusUpdater';
import { useNotifications } from '@/hooks/useNotifications';
import { Toaster } from 'sonner';

interface BookingSystemProviderProps {
  children: React.ReactNode;
  statusUpdateInterval?: number; // milliseconds (default: 5000 = 5 seconds)
  notificationCheckInterval?: number; // milliseconds (default: 10000 = 10 seconds)
  enableStatusUpdates?: boolean; // default: true
  enableNotifications?: boolean; // default: true
  showToasts?: boolean; // default: true
}

export function BookingSystemProvider({
  children,
  statusUpdateInterval = 5000,
  notificationCheckInterval = 10000,
  enableStatusUpdates = true,
  enableNotifications = true,
  showToasts = true,
}: BookingSystemProviderProps) {
  // Enable automatic status updates
  const { stats, changeHistory } = useBookingStatusUpdater({
    intervalMs: statusUpdateInterval,
    enabled: enableStatusUpdates,
    onStatusChange: (changes) => {
      console.log('[Booking System] Status changes detected:', changes);
    },
  });

  // Enable automatic notifications
  const { unreadCount, lastCheck } = useNotifications({
    intervalMs: notificationCheckInterval,
    enabled: enableNotifications,
    showToast: showToasts,
  });

  // Log system status periodically (optional)
  useEffect(() => {
    const logInterval = setInterval(() => {
      console.log('[Booking System] Status:', {
        bookingStats: stats,
        unreadNotifications: unreadCount,
        lastNotificationCheck: lastCheck,
        recentChanges: changeHistory.slice(0, 3),
      });
    }, 60000); // Log every minute

    return () => clearInterval(logInterval);
  }, [stats, unreadCount, lastCheck, changeHistory]);

  return (
    <>
      {children}
      {showToasts && <Toaster position="top-right" richColors />}
    </>
  );
}
