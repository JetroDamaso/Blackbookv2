'use server';

/**
 * Server Action: Create canceled booking notification in database
 * This notifies employees when a booking is canceled
 */

import { createBulkNotifications } from '@/lib/notifications';
import { prisma } from '@/server/db';

export async function createCanceledBookingNotification(booking: {
  id: number;
  eventName: string;
  clientName: string;
  startAt: Date;
  canceledBy: string;
  cancellationReason: string;
}) {
  try {
    // Get all active employees (they will receive the notification)
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    if (employees.length === 0) {
      console.log('[Notification] No employees found to notify about cancellation');
      return { success: true };
    }

    const userIds = employees.map((emp: { id: string }) => emp.id);
    const eventDate = booking.startAt.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Create notifications for all relevant users
    await createBulkNotifications(userIds, {
      type: 'BOOKING',
      title: 'Booking Canceled',
      message: `Booking canceled: ${booking.eventName} on ${eventDate} for ${booking.clientName}. Reason: ${booking.cancellationReason}`,
      link: `/bookings/${booking.id}`,
    });

    // Delete any scheduled payment reminders for this booking since it's canceled
    await prisma.scheduledNotification.deleteMany({
      where: {
        bookingId: booking.id,
        notificationType: {
          in: ['PAYMENT_REMINDER_7', 'PAYMENT_REMINDER_3', 'PAYMENT_REMINDER_1'],
        },
      },
    });

    console.log(`[Notification] Created cancellation notification and removed reminders for booking #${booking.id}`);
    return { success: true };
  } catch (error) {
    console.error('[Notification] Failed to create cancellation notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}
