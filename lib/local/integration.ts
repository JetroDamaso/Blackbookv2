/**
 * Booking Creation Integration Helper
 * Call this when creating a new booking to sync with LocalStorage
 */

import {
  addLocalBooking,
  syncBookingsFromDatabase,
  type LocalBooking
} from '@/lib/local/storage';
import { calculateBookingStatus } from '@/lib/local/status-updater';

/**
 * Add a newly created booking to LocalStorage
 * Call this after successfully creating a booking in the database
 */
export async function integrateNewBooking(booking: {
  id: number;
  eventName: string;
  startAt: Date;
  endAt: Date;
  clientId: number;
  pavilionId: number | null;
  billing?: {
    balance: number;
    originalPrice: number;
  };
  createdAt?: Date;
}): Promise<void> {
  const localBooking: LocalBooking = {
    id: booking.id,
    eventName: booking.eventName,
    startAt: booking.startAt.toISOString(),
    endAt: booking.endAt.toISOString(),
    status: 1, // Default to Pending
    balance: booking.billing?.balance || 0,
    originalPrice: booking.billing?.originalPrice || 0,
    pavilionId: booking.pavilionId,
    clientId: booking.clientId,
    createdAt: booking.createdAt ? booking.createdAt.toISOString() : new Date().toISOString(),
  };

  // Calculate correct initial status
  localBooking.status = calculateBookingStatus(localBooking);

  // Add to LocalStorage
  addLocalBooking(localBooking);

  // NOTE: Notification is now created via database (createBookingNotification)
  // to support cross-origin/device sync. LocalStorage notification removed.

  console.log('[Integration] New booking added to LocalStorage:', localBooking);
}

/**
 * Sync all bookings from database to LocalStorage
 * Call this on app initialization or when user logs in
 */
export async function syncAllBookings(bookings: any[]): Promise<void> {
  syncBookingsFromDatabase(bookings);
  console.log(`[Integration] Synced ${bookings.length} bookings to LocalStorage`);
}

/**
 * Update booking payment in LocalStorage
 * Call this when payment is updated
 */
export async function updateBookingPayment(
  bookingId: number,
  newBalance: number
): Promise<void> {
  const { updateLocalBooking } = await import('@/lib/local/storage');

  updateLocalBooking(bookingId, { balance: newBalance });

  console.log(`[Integration] Updated payment for booking #${bookingId}, new balance: ₱${newBalance}`);
}
