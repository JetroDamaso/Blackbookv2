'use client';

/**
 * Scheduled Notification Processor
 * Runs in the background to check and send scheduled notifications
 */

import { useEffect } from 'react';
import { processScheduledNotifications } from '@/app/actions/processScheduledNotifications';

export function ScheduledNotificationProcessor() {
  useEffect(() => {
    // Process immediately on mount
    processScheduledNotifications();

    // Check every 5 minutes (300000ms)
    const intervalId = setInterval(() => {
      processScheduledNotifications();
    }, 300000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
