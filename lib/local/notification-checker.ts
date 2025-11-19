/**
 * Notification Checker (Client-Side)
 * Checks booking dates and triggers scheduled notifications
 */

import {
  getLocalBookings,
  getLocalNotifications,
  addLocalNotification,
  getNotificationSchedules,
  updateNotificationSchedule,
  type LocalBooking,
} from './storage';
import { BOOKING_STATUS } from './status-updater';

/**
 * Check if a notification has already been triggered for this booking
 */
function hasNotificationBeenTriggered(bookingId: number, type: string): boolean {
  const notifications = getLocalNotifications();
  return notifications.some(n => n.bookingId === bookingId && n.type === type && n.triggered);
}

/**
 * Get days until event starts
 */
function getDaysUntilEvent(booking: LocalBooking, now: Date = new Date()): number {
  const startAt = new Date(booking.startAt);
  const diffMs = startAt.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Get days since notification was last sent
 */
function getDaysSinceLastNotification(bookingId: number): number | null {
  const schedules = getNotificationSchedules();
  const schedule = schedules.find(s => s.bookingId === bookingId);

  if (!schedule || !schedule.lastNotificationSent) {
    return null;
  }

  const lastSent = new Date(schedule.lastNotificationSent);
  const now = new Date();
  const diffMs = now.getTime() - lastSent.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check and send payment alert notifications (1 week, 3 days, 1 day before)
 */
export function checkPaymentAlerts(): void {
  const bookings = getLocalBookings();
  const now = new Date();

  bookings.forEach(booking => {
    // Only check for Confirmed or Pending bookings with balance
    if (
      (booking.status === BOOKING_STATUS.CONFIRMED || booking.status === BOOKING_STATUS.PENDING) &&
      booking.balance > 0
    ) {
      const daysUntil = getDaysUntilEvent(booking, now);

      // 1 Week Before (7 days)
      if (daysUntil === 7 && !hasNotificationBeenTriggered(booking.id, 'payment_1week')) {
        addLocalNotification({
          bookingId: booking.id,
          type: 'payment_1week',
          message: `Payment reminder: Event "${booking.eventName}" is 1 week away. Balance: ₱${booking.balance.toLocaleString()}`,
          read: false,
          triggered: true,
          eventName: booking.eventName,
        });
        updateNotificationSchedule(booking.id, 'payment_1week');
        console.log(`[Notification] Payment alert (1 week) sent for Booking #${booking.id}`);
      }

      // 3 Days Before
      if (daysUntil === 3 && !hasNotificationBeenTriggered(booking.id, 'payment_3days')) {
        addLocalNotification({
          bookingId: booking.id,
          type: 'payment_3days',
          message: `Payment reminder: Event "${booking.eventName}" is 3 days away. Balance: ₱${booking.balance.toLocaleString()}`,
          read: false,
          triggered: true,
          eventName: booking.eventName,
        });
        updateNotificationSchedule(booking.id, 'payment_3days');
        console.log(`[Notification] Payment alert (3 days) sent for Booking #${booking.id}`);
      }

      // 1 Day Before
      if (daysUntil === 1 && !hasNotificationBeenTriggered(booking.id, 'payment_1day')) {
        addLocalNotification({
          bookingId: booking.id,
          type: 'payment_1day',
          message: `Payment reminder: Event "${booking.eventName}" is tomorrow! Balance: ₱${booking.balance.toLocaleString()}`,
          read: false,
          triggered: true,
          eventName: booking.eventName,
        });
        updateNotificationSchedule(booking.id, 'payment_1day');
        console.log(`[Notification] Payment alert (1 day) sent for Booking #${booking.id}`);
      }
    }
  });
}

/**
 * Check and send unpaid booking reminders (every 3 days)
 */
export function checkUnpaidReminders(): void {
  const bookings = getLocalBookings();

  bookings.forEach(booking => {
    // Only check Unpaid bookings
    if (booking.status === BOOKING_STATUS.UNPAID) {
      const daysSinceLastNotif = getDaysSinceLastNotification(booking.id);

      // Send reminder if:
      // - No notification has been sent yet, OR
      // - It's been 3+ days since last notification
      if (daysSinceLastNotif === null || daysSinceLastNotif >= 3) {
        addLocalNotification({
          bookingId: booking.id,
          type: 'unpaid_reminder',
          message: `Unpaid booking: Event "${booking.eventName}" has ended with outstanding balance: ₱${booking.balance.toLocaleString()}`,
          read: false,
          triggered: true,
          eventName: booking.eventName,
        });
        updateNotificationSchedule(booking.id, 'unpaid_reminder');
        console.log(`[Notification] Unpaid reminder sent for Booking #${booking.id}`);
      }
    }
  });
}

/**
 * Send notification for new booking creation
 */
export function sendNewBookingNotification(booking: LocalBooking): void {
  addLocalNotification({
    bookingId: booking.id,
    type: 'new_booking',
    message: `New booking created: "${booking.eventName}" on ${new Date(booking.startAt).toLocaleDateString()}`,
    read: false,
    triggered: true,
    eventName: booking.eventName,
  });
  updateNotificationSchedule(booking.id, 'new_booking');
  console.log(`[Notification] New booking notification sent for Booking #${booking.id}`);
}

/**
 * Run all notification checks
 */
export function checkAllNotifications(): void {
  checkPaymentAlerts();
  checkUnpaidReminders();
}

/**
 * Get notification summary
 */
export function getNotificationSummary() {
  const notifications = getLocalNotifications();

  return {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    byType: {
      newBooking: notifications.filter(n => n.type === 'new_booking').length,
      payment1Week: notifications.filter(n => n.type === 'payment_1week').length,
      payment3Days: notifications.filter(n => n.type === 'payment_3days').length,
      payment1Day: notifications.filter(n => n.type === 'payment_1day').length,
      unpaidReminder: notifications.filter(n => n.type === 'unpaid_reminder').length,
    },
  };
}
