/**
 * React Hook: useBookingStatusUpdater
 * Automatically updates booking statuses in real-time (client-side)
 */

'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { updateAllBookingStatuses, getStatusStatistics } from '@/lib/local/status-updater';
import { getLocalBookings } from '@/lib/local/storage';

interface StatusChange {
  bookingId: number;
  oldStatus: number;
  newStatus: number;
  timestamp: string;
}

interface UseBookingStatusUpdaterOptions {
  intervalMs?: number; // Check interval in milliseconds (default: 5000 = 5 seconds)
  enabled?: boolean; // Enable/disable auto-updates (default: true)
  onStatusChange?: (changes: StatusChange[]) => void; // Callback when status changes
}

export function useBookingStatusUpdater(options: UseBookingStatusUpdaterOptions = {}) {
  const {
    intervalMs = 5000, // Check every 5 seconds by default
    enabled = true,
    onStatusChange,
  } = options;

  const [stats, setStats] = useState(getStatusStatistics());
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [changeHistory, setChangeHistory] = useState<StatusChange[]>([]);

  // Use ref to store the latest callback without causing re-renders
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  // Manual trigger for status update
  const updateStatuses = useCallback(() => {
    const changes = updateAllBookingStatuses();

    if (changes.length > 0) {
      const timestamp = new Date().toISOString();
      const statusChanges: StatusChange[] = changes.map(change => ({
        ...change,
        timestamp,
      }));

      setChangeHistory(prev => [...statusChanges, ...prev].slice(0, 50)); // Keep last 50 changes
      setLastUpdate(new Date());

      if (onStatusChangeRef.current) {
        onStatusChangeRef.current(statusChanges);
      }
    }

    // Update statistics
    setStats(getStatusStatistics());
  }, []);

  // Auto-update timer
  useEffect(() => {
    if (!enabled) return;

    // Update function inside effect to avoid dependency issues
    const performUpdate = () => {
      const changes = updateAllBookingStatuses();

      if (changes.length > 0) {
        const timestamp = new Date().toISOString();
        const statusChanges: StatusChange[] = changes.map(change => ({
          ...change,
          timestamp,
        }));

        setChangeHistory(prev => [...statusChanges, ...prev].slice(0, 50));
        setLastUpdate(new Date());

        if (onStatusChangeRef.current) {
          onStatusChangeRef.current(statusChanges);
        }
      }

      setStats(getStatusStatistics());
    };

    // Run immediately on mount
    performUpdate();

    // Set up interval
    const intervalId = setInterval(() => {
      performUpdate();
    }, intervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, intervalMs]); // Removed onStatusChange from deps

  // Listen for cross-tab updates
  useEffect(() => {
    const handleStorageUpdate = () => {
      setStats(getStatusStatistics());
      setLastUpdate(new Date());
    };

    window.addEventListener('bookings-updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener('bookings-updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  return {
    stats,
    lastUpdate,
    changeHistory,
    updateStatuses,
  };
}

/**
 * React Hook: useBookings
 * Get bookings with real-time updates
 */
export function useBookings() {
  const [bookings, setBookings] = useState(getLocalBookings());
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(() => {
    setIsLoading(true);
    setBookings(getLocalBookings());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Initial load
    setBookings(getLocalBookings());

    // Listen for updates
    const handleUpdate = () => {
      setBookings(getLocalBookings());
    };

    window.addEventListener('bookings-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('bookings-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []); // Empty dependency array - only set up listeners once

  return {
    bookings,
    isLoading,
    refresh,
  };
}
