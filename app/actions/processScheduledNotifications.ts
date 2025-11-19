'use server';

/**
 * Server Action: Process scheduled notifications
 * Checks for due notifications and sends them
 */

import { prisma } from '@/server/db';
import { createBulkNotifications } from '@/lib/notifications';

export async function processScheduledNotifications() {
  try {
    const now = new Date();

    // Find all unsent notifications that are due
    const dueNotifications = await prisma.scheduledNotification.findMany({
      where: {
        sent: false,
        scheduledFor: {
          lte: now,
        },
      },
      include: {
        booking: {
          include: {
            client: true,
            billing: true,
          },
        },
      },
    });

    if (dueNotifications.length === 0) {
      return { success: true, processed: 0 };
    }

    // Get all active employees
    const employees = await prisma.employee.findMany({
      where: {
        isActive: true,
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    const userIds = employees.map((emp: { id: string }) => emp.id);

    if (userIds.length === 0) {
      console.log('[Scheduled Notifications] No employees found to notify');
      return { success: true, processed: 0 };
    }

    let processedCount = 0;

    // Process each notification
    for (const scheduledNotif of dueNotifications) {
      // Mark as sent FIRST to prevent duplicate processing in race conditions
      try {
        await prisma.scheduledNotification.update({
          where: { id: scheduledNotif.id },
          data: {
            sent: true,
            sentAt: now,
          },
        });
      } catch (error) {
        // If update fails, skip this notification (might have been processed by another instance)
        console.log(`[Scheduled Notifications] Skipping notification ${scheduledNotif.id} - already processed`);
        continue;
      }

      const booking = scheduledNotif.booking;
      const client = booking.client;
      const billing = booking.billing;

      if (!booking || !client || !booking.startAt) continue;

      const eventDate = new Date(booking.startAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      const clientName = `${client.firstName} ${client.lastName}`.trim();
      const balance = billing?.balance || 0;

      let message = '';
      let title = '';

      switch (scheduledNotif.notificationType) {
        case 'PAYMENT_REMINDER_7':
          title = 'Payment Reminder - 7 Days';
          message = `Payment reminder: ${booking.eventName} on ${eventDate} by ${clientName}. Balance: ₱${balance.toFixed(2)}`;
          break;
        case 'PAYMENT_REMINDER_3':
          title = 'Payment Reminder - 3 Days';
          message = `Payment reminder: ${booking.eventName} on ${eventDate} by ${clientName}. Balance: ₱${balance.toFixed(2)}`;
          break;
        case 'PAYMENT_REMINDER_1':
          title = 'Payment Reminder - 1 Day';
          message = `Payment reminder: ${booking.eventName} on ${eventDate} by ${clientName}. Balance: ₱${balance.toFixed(2)}`;
          break;
        case 'PAYMENT_OVERDUE':
          title = 'Payment Overdue';
          message = `Payment overdue: ${booking.eventName} on ${eventDate} by ${clientName}. Balance: ₱${balance.toFixed(2)}`;
          break;
        default:
          continue;
      }

      // Only send notification if there's a balance
      if (balance > 0) {
        // Check if a similar notification already exists (prevent duplicates)
        const existingNotification = await prisma.notification.findFirst({
          where: {
            bookingId: booking.id,
            type: 'PAYMENT',
            title,
            message,
            createdAt: {
              gte: new Date(now.getTime() - 60000), // Within last 1 minute
            },
          },
        });

        if (!existingNotification) {
          await createBulkNotifications(userIds, {
            type: 'PAYMENT',
            title,
            message,
            link: `/bookings/${booking.id}`,
          });
          processedCount++;
        } else {
          console.log(`[Scheduled Notifications] Skipping duplicate notification for booking #${booking.id}`);
        }
      }
    }

    console.log(`[Scheduled Notifications] Processed ${processedCount} notifications`);
    return { success: true, processed: processedCount };
  } catch (error) {
    console.error('[Scheduled Notifications] Error processing:', error);
    return { success: false, error: 'Failed to process scheduled notifications' };
  }
}
