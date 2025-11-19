'use client';

import { useEffect } from 'react';
import { syncAllBookings } from '@/lib/local/integration';
import { useQuery } from '@tanstack/react-query';

/**
 * BookingSync Component
 *
 * Automatically syncs all bookings from the database to LocalStorage
 * when the component mounts. This should be included in your root layout
 * or dashboard to ensure offline system has up-to-date data.
 *
 * Usage:
 * ```tsx
 * <BookingSync />
 * ```
 */
export function BookingSync() {
  const { data: bookings } = useQuery({
    queryKey: ['allBookings'],
    queryFn: async () => {
      const response = await fetch('/api/bookings/all');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    if (bookings && Array.isArray(bookings) && bookings.length > 0) {
      // Map database bookings to LocalStorage format
      const mappedBookings = bookings
        .filter((booking: any) => booking.startAt && booking.endAt) // Only sync bookings with dates
        .map((booking: any) => ({
          id: booking.id?.toString() || '',
          eventName: booking.eventName || 'Unnamed Event',
          startAt: new Date(booking.startAt),
          endAt: new Date(booking.endAt),
          clientId: booking.clientId?.toString() || '',
          pavilionId: booking.pavilionId?.toString() || '',
          billing: {
            balance: Number(booking.billing?.balance || 0),
            originalPrice: Number(booking.billing?.originalPrice || 0),
          },
          createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
        }));

      if (mappedBookings.length > 0) {
        syncAllBookings(mappedBookings);
        console.log(`✅ Synced ${mappedBookings.length} bookings to LocalStorage`);
      }
    }
  }, [bookings]);

  // This component renders nothing, it just handles data sync
  return null;
}
