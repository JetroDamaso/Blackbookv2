/**
 * Booking Status Codes:
 * 1 = Pending - No payments yet
 * 2 = Confirmed - Has payment(s) but event hasn't started
 * 3 = In Progress - Event is happening today (between start and end date)
 * 4 = Completed - Event is past AND payment is fully paid
 * 5 = Unpaid - Event is past AND payment is NOT fully paid
 * 6 = Canceled - Booking has been canceled (manual status)
 * 7 = Archived - Booking has been archived (manual status)
 * 8 = Draft - Booking is still being drafted/incomplete (manual status)
 */

/**
 * Calculate the booking status based on payment and date
 *
 * Status logic:
 * - 1 (Pending): No payments yet
 * - 2 (Confirmed): Has payment(s) but event hasn't started
 * - 3 (In Progress): Event date is today
 * - 4 (Completed): Event date is past AND payment is fully paid
 * - 5 (Unpaid): Event date is past AND payment is NOT fully paid
 * - 6 (Canceled): Manual status - must be set explicitly
 * - 7 (Archived): Manual status - must be set explicitly
 * - 8 (Draft): Manual status - must be set explicitly
 *
 * Note: This is a pure calculation function, not a server action.
 * It's used by server actions but doesn't need to be async itself.
 * Manual statuses (6, 7, 8) are preserved and not automatically changed.
 */
export function calculateBookingStatus(params: {
  hasPayments: boolean;
  isFullyPaid: boolean;
  eventStartDate: Date;
  eventEndDate: Date;
  currentStatus?: number; // Optional: preserve manual statuses
}): number {
  const { hasPayments, isFullyPaid, eventStartDate, eventEndDate, currentStatus } = params;

  // Preserve manual statuses (6 = Canceled, 7 = Archived, 8 = Draft)
  // These should not be automatically changed
  if (currentStatus && [6, 7, 8].includes(currentStatus)) {
    return currentStatus;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  const startDate = new Date(eventStartDate);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(eventEndDate);
  endDate.setHours(23, 59, 59, 999); // End of day

  // Check if event is today (start date is today OR today is between start and end)
  const isToday = today.getTime() >= startDate.getTime() && today.getTime() <= endDate.getTime();

  // Check if event is in the past (today is after the end date)
  const isPast = today.getTime() > endDate.getTime();

  // Status 3: In Progress - event is happening today
  if (isToday) {
    return 3;
  }

  // Status 4: Completed - event is past AND fully paid
  if (isPast && isFullyPaid) {
    return 4;
  }

  // Status 5: Unpaid - event is past AND not fully paid
  if (isPast && !isFullyPaid) {
    return 5;
  }

  // Status 2: Confirmed - has payments but event hasn't started
  if (hasPayments) {
    return 2;
  }

  // Status 1: Pending - no payments yet
  return 1;
}
