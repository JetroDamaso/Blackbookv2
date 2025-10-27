"use server";

import { prisma } from "@/server/db";
import { format } from "date-fns";

/**
 * Schedule all payment reminder notifications for a booking
 */
export async function scheduleBookingNotifications(bookingId: number) {
  try {
    // Get booking details with client, billing, and creator info
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        billing: true,
        createdBy: {
          include: { role: true },
        },
      },
    });

    if (!booking || !booking.startAt) {
      console.log("Booking not found or missing start date");
      return;
    }

    const eventDate = new Date(booking.startAt);
    const now = new Date();

    // Calculate notification dates
    const sevenDaysBefore = new Date(eventDate);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
    sevenDaysBefore.setHours(8, 0, 0, 0); // 8 AM

    const threeDaysBefore = new Date(eventDate);
    threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
    threeDaysBefore.setHours(8, 0, 0, 0); // 8 AM

    const oneDayBefore = new Date(eventDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(8, 0, 0, 0); // 8 AM

    const onEventDay = new Date(eventDate);
    onEventDay.setHours(8, 0, 0, 0); // 8 AM on event day

    // Schedule notifications only if dates are in the future
    const scheduledNotifications = [];

    if (sevenDaysBefore > now) {
      scheduledNotifications.push({
        bookingId,
        notificationType: "PAYMENT_REMINDER_7",
        scheduledFor: sevenDaysBefore,
      });
    }

    if (threeDaysBefore > now) {
      scheduledNotifications.push({
        bookingId,
        notificationType: "PAYMENT_REMINDER_3",
        scheduledFor: threeDaysBefore,
      });
    }

    if (oneDayBefore > now) {
      scheduledNotifications.push({
        bookingId,
        notificationType: "PAYMENT_REMINDER_1",
        scheduledFor: oneDayBefore,
      });
    }

    if (onEventDay > now) {
      scheduledNotifications.push({
        bookingId,
        notificationType: "PAYMENT_OVERDUE",
        scheduledFor: onEventDay,
      });
    }

    // Create scheduled notifications in database
    if (scheduledNotifications.length > 0) {
      await prisma.scheduledNotification.createMany({
        data: scheduledNotifications,
      });
    }

    console.log(
      `Scheduled ${scheduledNotifications.length} payment reminders for booking ${bookingId}`
    );
  } catch (error) {
    console.error("Error scheduling booking notifications:", error);
  }
}

/**
 * Send immediate notifications when a booking is created
 */
export async function sendBookingCreatedNotifications(bookingId: number) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        createdBy: {
          include: { role: true },
        },
      },
    });

    if (!booking) return;

    const eventDate = booking.startAt ? format(new Date(booking.startAt), "MMMM dd, yyyy") : "TBD";
    const creatorName = booking.createdBy
      ? `${booking.createdBy.firstName} ${booking.createdBy.lastName}`
      : "System";

    // Get all Manager and Owner employees
    const managersAndOwners = await prisma.employee.findMany({
      where: {
        isActive: true,
        role: {
          name: {
            in: ["Owner", "Manager"],
          },
        },
      },
    });

    // Create notifications for Managers and Owners
    const notifications = managersAndOwners.map(employee => ({
      userId: employee.id,
      type: "BOOKING",
      title: "New Booking Created",
      message: `New booking: ${booking.eventName} on ${eventDate} by ${creatorName}`,
      link: `/manage/bookings/${bookingId}`,
      read: false,
      bookingId: bookingId,
      clientId: booking.clientId,
    }));

    console.log(
      "Creating notifications for:",
      managersAndOwners.map(e => ({ id: e.id, name: `${e.firstName} ${e.lastName}` }))
    );
    console.log("Notification data:", notifications);

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    console.log(`Sent booking creation notifications to ${notifications.length} employees`);
  } catch (error) {
    console.error("Error sending booking created notifications:", error);
  }
}

/**
 * Send notifications when payment is completed
 */
export async function sendPaymentCompletedNotifications(bookingId: number, paymentAmount: number) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        billing: true,
      },
    });

    if (!booking) return;

    const eventDate = booking.startAt ? format(new Date(booking.startAt), "MMMM dd, yyyy") : "TBD";
    const formattedAmount = `₱${paymentAmount.toLocaleString()}`;
    const clientName = booking.client
      ? `${booking.client.firstName} ${booking.client.lastName}`
      : "Client";

    // Get all Manager and Owner employees
    const managersAndOwners = await prisma.employee.findMany({
      where: {
        isActive: true,
        role: {
          name: {
            in: ["Owner", "Manager"],
          },
        },
      },
    });

    // Create notifications for Managers and Owners
    const notifications = managersAndOwners.map(employee => ({
      userId: employee.id,
      type: "PAYMENT",
      title: "Payment Received",
      message: `Payment received: ${formattedAmount} from ${clientName} for ${booking.eventName} on ${eventDate}`,
      link: `/manage/bookings/${bookingId}`,
      read: false,
      bookingId: bookingId,
      clientId: booking.clientId,
    }));

    if (notifications.length > 0) {
      await prisma.notification.createMany({
        data: notifications,
      });
    }

    console.log(`Sent payment completion notifications to ${notifications.length} employees`);
  } catch (error) {
    console.error("Error sending payment completed notifications:", error);
  }
}

/**
 * Cancel pending payment reminders (called when payment is completed)
 */
export async function cancelPaymentReminders(bookingId: number) {
  try {
    await prisma.scheduledNotification.deleteMany({
      where: {
        bookingId,
        sent: false,
        notificationType: {
          in: ["PAYMENT_REMINDER_7", "PAYMENT_REMINDER_3", "PAYMENT_REMINDER_1", "PAYMENT_OVERDUE"],
        },
      },
    });

    console.log(`Cancelled pending payment reminders for booking ${bookingId}`);
  } catch (error) {
    console.error("Error cancelling payment reminders:", error);
  }
}

/**
 * Process all pending scheduled notifications
 * This function should be called by a cron job
 */
export async function processPendingNotifications() {
  try {
    const now = new Date();

    // Get all pending notifications that should be sent
    const pendingNotifications = await prisma.scheduledNotification.findMany({
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

    console.log(`Processing ${pendingNotifications.length} pending notifications`);

    for (const scheduled of pendingNotifications) {
      const { booking, notificationType } = scheduled;

      if (!booking) continue;

      const eventDate = booking.startAt
        ? format(new Date(booking.startAt), "MMMM dd, yyyy")
        : "TBD";
      const clientName = booking.client
        ? `${booking.client.firstName} ${booking.client.lastName}`
        : "Client";
      const totalAmount = booking.billing?.discountedPrice || booking.billing?.originalPrice || 0;
      const formattedAmount = `₱${totalAmount.toLocaleString()}`;

      // Get all Manager and Owner employees
      const managersAndOwners = await prisma.employee.findMany({
        where: {
          isActive: true,
          role: {
            name: {
              in: ["Owner", "Manager"],
            },
          },
        },
      });

      let notifications: any[] = [];

      switch (notificationType) {
        case "PAYMENT_REMINDER_7":
          // Notify Managers and Owners
          notifications = managersAndOwners.map(employee => ({
            userId: employee.id,
            type: "PAYMENT",
            title: "Payment Pending",
            message: `Payment pending: ${clientName}'s booking for ${booking.eventName} is in 7 days. Total: ${formattedAmount}`,
            link: `/manage/bookings/${booking.id}`,
            read: false,
            bookingId: booking.id,
            clientId: booking.clientId,
          }));
          break;

        case "PAYMENT_REMINDER_3":
          // Check if booking is unpaid (status 5)
          const isUnpaid3Days = booking.status === 5;

          if (isUnpaid3Days) {
            // Notify Managers and Owners about unpaid booking 3 days before event
            notifications = managersAndOwners.map(employee => ({
              userId: employee.id,
              type: "PAYMENT",
              title: "Urgent: Unpaid Booking",
              message: `Urgent: Booking for ${clientName} on ${eventDate} is still UNPAID (3 days remaining). Total: ${formattedAmount}`,
              link: `/manage/bookings/${booking.id}`,
              read: false,
              bookingId: booking.id,
              clientId: booking.clientId,
            }));
          } else {
            // Regular payment pending reminder
            notifications = managersAndOwners.map(employee => ({
              userId: employee.id,
              type: "PAYMENT",
              title: "Urgent: Payment Pending",
              message: `Urgent: Payment pending for ${clientName}'s booking on ${eventDate}. Total: ${formattedAmount}`,
              link: `/manage/bookings/${booking.id}`,
              read: false,
              bookingId: booking.id,
              clientId: booking.clientId,
            }));
          }
          break;

        case "PAYMENT_REMINDER_1":
          // Check if booking is unpaid (status 5)
          const isUnpaid1Day = booking.status === 5;

          if (isUnpaid1Day) {
            // Critical notification for unpaid booking 1 day before event
            notifications = managersAndOwners.map(employee => ({
              userId: employee.id,
              type: "PAYMENT",
              title: "Critical: Unpaid Booking Tomorrow",
              message: `Critical: Booking for ${clientName} tomorrow (${eventDate}) is UNPAID. Total: ${formattedAmount}. Immediate action required!`,
              link: `/manage/bookings/${booking.id}`,
              read: false,
              bookingId: booking.id,
              clientId: booking.clientId,
            }));
          } else {
            // Regular payment pending reminder
            notifications = managersAndOwners.map(employee => ({
              userId: employee.id,
              type: "PAYMENT",
              title: "Critical: Payment Pending",
              message: `Critical: Payment overdue for ${clientName}'s booking tomorrow. Total: ${formattedAmount}`,
              link: `/manage/bookings/${booking.id}`,
              read: false,
              bookingId: booking.id,
              clientId: booking.clientId,
            }));
          }
          break;

        case "PAYMENT_OVERDUE":
          // Check if payment is still pending
          const isPaid = booking.billing?.status === 2; // Assuming status 2 means paid

          if (!isPaid) {
            // Notify only Owners
            const owners = await prisma.employee.findMany({
              where: {
                isActive: true,
                role: {
                  name: "Owner",
                },
              },
            });

            notifications = owners.map(employee => ({
              userId: employee.id,
              type: "PAYMENT",
              title: "Payment Overdue",
              message: `Payment overdue: ${clientName}'s event is today. Total: ${formattedAmount}. Status: ${isPaid ? "Paid" : "Unpaid"}`,
              link: `/manage/bookings/${booking.id}`,
              read: false,
              bookingId: booking.id,
              clientId: booking.clientId,
            }));
          }
          break;
      }

      // Create notifications
      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
        });
      }

      // Mark scheduled notification as sent
      await prisma.scheduledNotification.update({
        where: { id: scheduled.id },
        data: {
          sent: true,
          sentAt: new Date(),
        },
      });

      console.log(
        `Sent ${notificationType} notification for booking ${booking.id} to ${notifications.length} users`
      );
    }

    return {
      success: true,
      processed: pendingNotifications.length,
    };
  } catch (error) {
    console.error("Error processing pending notifications:", error);
    throw error;
  }
}
