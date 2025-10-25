/**
 * Booking Status Constants
 *
 * Use these constants instead of magic numbers throughout the application
 */

export const BOOKING_STATUS = {
  PENDING: 1, // No payments yet
  CONFIRMED: 2, // Has payment(s) but event hasn't started
  IN_PROGRESS: 3, // Event is happening today
  COMPLETED: 4, // Event is past AND fully paid
  UNPAID: 5, // Event is past AND NOT fully paid
  CANCELED: 6, // Booking canceled (manual)
  ARCHIVED: 7, // Booking archived (manual)
  DRAFT: 8, // Booking is draft/incomplete (manual)
} as const;

export const BOOKING_STATUS_LABELS = {
  [BOOKING_STATUS.PENDING]: "Pending",
  [BOOKING_STATUS.CONFIRMED]: "Confirmed",
  [BOOKING_STATUS.IN_PROGRESS]: "In Progress",
  [BOOKING_STATUS.COMPLETED]: "Completed",
  [BOOKING_STATUS.UNPAID]: "Unpaid",
  [BOOKING_STATUS.CANCELED]: "Canceled",
  [BOOKING_STATUS.ARCHIVED]: "Archived",
  [BOOKING_STATUS.DRAFT]: "Draft",
} as const;

export const BOOKING_STATUS_COLORS = {
  [BOOKING_STATUS.PENDING]: "bg-gray-100 text-gray-800",
  [BOOKING_STATUS.CONFIRMED]: "bg-blue-100 text-blue-800",
  [BOOKING_STATUS.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
  [BOOKING_STATUS.COMPLETED]: "bg-green-100 text-green-800",
  [BOOKING_STATUS.UNPAID]: "bg-red-100 text-red-800",
  [BOOKING_STATUS.CANCELED]: "bg-red-100 text-red-800",
  [BOOKING_STATUS.ARCHIVED]: "bg-gray-100 text-gray-800",
  [BOOKING_STATUS.DRAFT]: "bg-orange-100 text-orange-800",
} as const;

/**
 * Check if a status is a manual status that should not be auto-updated
 */
export function isManualStatus(status: number): boolean {
  return [BOOKING_STATUS.CANCELED, BOOKING_STATUS.ARCHIVED, BOOKING_STATUS.DRAFT].includes(
    status as any
  );
}

/**
 * Check if a status is an automatic status that can be updated by the system
 */
export function isAutoStatus(status: number): boolean {
  return !isManualStatus(status);
}
