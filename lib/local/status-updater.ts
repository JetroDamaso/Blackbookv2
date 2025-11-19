/**
 * Booking Status Updater (Client-Side)
 * Automatically updates booking statuses based on time and payment conditions
 */

import {
  getLocalBookings,
  updateLocalBooking,
  type LocalBooking,
} from './storage';

/**
 * Booking Status Definitions:
 * 1 - Pending (no payment)
 * 2 - Confirmed (down payment received)
 * 3 - In Progress (event is happening now)
 * 4 - Completed (ended with full payment)
 * 5 - Unpaid (ended with remaining balance)
 * 6 - Cancelled (manually cancelled)
 * 7 - Archived (old bookings)
 */

export const BOOKING_STATUS = {
  PENDING: 1,
  CONFIRMED: 2,
  IN_PROGRESS: 3,
  COMPLETED: 4,
  UNPAID: 5,
  CANCELLED: 6,
  ARCHIVED: 7,
} as const;

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: 'Pending',
  [BOOKING_STATUS.CONFIRMED]: 'Confirmed',
  [BOOKING_STATUS.IN_PROGRESS]: 'In Progress',
  [BOOKING_STATUS.COMPLETED]: 'Completed',
  [BOOKING_STATUS.UNPAID]: 'Unpaid',
  [BOOKING_STATUS.CANCELLED]: 'Cancelled',
  [BOOKING_STATUS.ARCHIVED]: 'Archived',
} as const;

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: 'yellow',
  [BOOKING_STATUS.CONFIRMED]: 'blue',
  [BOOKING_STATUS.IN_PROGRESS]: 'purple',
  [BOOKING_STATUS.COMPLETED]: 'green',
  [BOOKING_STATUS.UNPAID]: 'red',
  [BOOKING_STATUS.CANCELLED]: 'gray',
  [BOOKING_STATUS.ARCHIVED]: 'slate',
} as const;

/**
 * Determine the correct status for a booking based on current conditions
 */
export function calculateBookingStatus(booking: LocalBooking, now: Date = new Date()): number {
  const startAt = new Date(booking.startAt);
  const endAt = new Date(booking.endAt);

  // Don't auto-transition Cancelled or Archived bookings
  if (booking.status === BOOKING_STATUS.CANCELLED || booking.status === BOOKING_STATUS.ARCHIVED) {
    return booking.status;
  }

  // Check if event has ended
  const hasEnded = now >= endAt;

  // Check if event is in progress
  const isInProgress = now >= startAt && now < endAt;

  // Check payment status
  const hasBalance = booking.balance > 0;
  const hasNoPayment = booking.balance === booking.originalPrice;

  // Status transition logic
  if (hasEnded) {
    // Event has ended
    if (hasBalance) {
      return BOOKING_STATUS.UNPAID; // Ended with balance remaining
    } else {
      return BOOKING_STATUS.COMPLETED; // Ended with full payment
    }
  } else if (isInProgress) {
    // Event is happening now
    return BOOKING_STATUS.IN_PROGRESS;
  } else {
    // Event hasn't started yet
    if (hasNoPayment) {
      return BOOKING_STATUS.PENDING; // No payment made
    } else {
      return BOOKING_STATUS.CONFIRMED; // Down payment received
    }
  }
}

/**
 * Check and update all booking statuses
 * Returns array of bookings that changed status
 */
export function updateAllBookingStatuses(): Array<{ bookingId: number; oldStatus: number; newStatus: number }> {
  const bookings = getLocalBookings();
  const now = new Date();
  const changes: Array<{ bookingId: number; oldStatus: number; newStatus: number }> = [];

  bookings.forEach(booking => {
    const oldStatus = booking.status;
    const newStatus = calculateBookingStatus(booking, now);

    if (oldStatus !== newStatus) {
      updateLocalBooking(booking.id, { status: newStatus });
      changes.push({
        bookingId: booking.id,
        oldStatus,
        newStatus,
      });

      console.log(`[Status Update] Booking #${booking.id} (${booking.eventName}): ${BOOKING_STATUS_LABELS[oldStatus as keyof typeof BOOKING_STATUS_LABELS]} → ${BOOKING_STATUS_LABELS[newStatus as keyof typeof BOOKING_STATUS_LABELS]}`);
    }
  });

  return changes;
}

/**
 * Get bookings by status
 */
export function getBookingsByStatus(status: number): LocalBooking[] {
  const bookings = getLocalBookings();
  return bookings.filter(b => b.status === status);
}

/**
 * Get bookings that need status updates
 */
export function getBookingsNeedingUpdate(): LocalBooking[] {
  const bookings = getLocalBookings();
  const now = new Date();

  return bookings.filter(booking => {
    const currentStatus = booking.status;
    const calculatedStatus = calculateBookingStatus(booking, now);
    return currentStatus !== calculatedStatus;
  });
}

/**
 * Get status statistics
 */
export function getStatusStatistics() {
  const bookings = getLocalBookings();

  const stats = {
    total: bookings.length,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    unpaid: 0,
    cancelled: 0,
    archived: 0,
  };

  bookings.forEach(booking => {
    switch (booking.status) {
      case BOOKING_STATUS.PENDING:
        stats.pending++;
        break;
      case BOOKING_STATUS.CONFIRMED:
        stats.confirmed++;
        break;
      case BOOKING_STATUS.IN_PROGRESS:
        stats.inProgress++;
        break;
      case BOOKING_STATUS.COMPLETED:
        stats.completed++;
        break;
      case BOOKING_STATUS.UNPAID:
        stats.unpaid++;
        break;
      case BOOKING_STATUS.CANCELLED:
        stats.cancelled++;
        break;
      case BOOKING_STATUS.ARCHIVED:
        stats.archived++;
        break;
    }
  });

  return stats;
}

/**
 * Get upcoming bookings (Confirmed or Pending, starting soon)
 */
export function getUpcomingBookings(withinHours: number = 24): LocalBooking[] {
  const bookings = getLocalBookings();
  const now = new Date();
  const threshold = new Date(now.getTime() + withinHours * 60 * 60 * 1000);

  return bookings.filter(booking => {
    const startAt = new Date(booking.startAt);
    const isUpcoming = startAt > now && startAt <= threshold;
    const isConfirmedOrPending =
      booking.status === BOOKING_STATUS.CONFIRMED ||
      booking.status === BOOKING_STATUS.PENDING;

    return isUpcoming && isConfirmedOrPending;
  });
}

/**
 * Get in-progress bookings
 */
export function getInProgressBookings(): LocalBooking[] {
  return getBookingsByStatus(BOOKING_STATUS.IN_PROGRESS);
}

/**
 * Get unpaid bookings
 */
export function getUnpaidBookings(): LocalBooking[] {
  return getBookingsByStatus(BOOKING_STATUS.UNPAID);
}
