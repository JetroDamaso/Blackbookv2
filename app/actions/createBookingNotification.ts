'use server';

/**
 * Server Action: Create booking notification in database
 * This ensures notifications work across different origins/devices
 */

import { createBulkNotifications } from '@/lib/notifications';
import { prisma } from '@/server/db';

export async function createBookingNotification(booking: {
  id: number;
  eventName: string;
  clientName: string;
  startAt: Date;
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
      console.log('[Notification] No employees found to notify');
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
      title: 'New Booking Created',
      message: `New booking: ${booking.eventName} on ${eventDate} for ${booking.clientName}`,
      link: `/bookings/${booking.id}`,
    });

    // Create scheduled payment reminder notifications
    const eventDateTime = new Date(booking.startAt);
    const now = new Date();

    // Payment reminder 7 days before event
    const reminder7Days = new Date(eventDateTime);
    reminder7Days.setDate(reminder7Days.getDate() - 7);
    if (reminder7Days > now) {
      await prisma.scheduledNotification.create({
        data: {
          bookingId: booking.id,
          notificationType: 'PAYMENT_REMINDER_7',
          scheduledFor: reminder7Days,
        },
      });
    }

    // Payment reminder 3 days before event
    const reminder3Days = new Date(eventDateTime);
    reminder3Days.setDate(reminder3Days.getDate() - 3);
    if (reminder3Days > now) {
      await prisma.scheduledNotification.create({
        data: {
          bookingId: booking.id,
          notificationType: 'PAYMENT_REMINDER_3',
          scheduledFor: reminder3Days,
        },
      });
    }

    // Payment reminder 1 day before event
    const reminder1Day = new Date(eventDateTime);
    reminder1Day.setDate(reminder1Day.getDate() - 1);
    if (reminder1Day > now) {
      await prisma.scheduledNotification.create({
        data: {
          bookingId: booking.id,
          notificationType: 'PAYMENT_REMINDER_1',
          scheduledFor: reminder1Day,
        },
      });
    }

    console.log(`[Notification] Created booking notification and scheduled reminders for booking #${booking.id}`);
    return { success: true };
  } catch (error) {
    console.error('[Notification] Failed to create booking notification:', error);
    return { success: false, error: 'Failed to create notification' };
  }
}
