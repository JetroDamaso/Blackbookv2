/**
 * Notification System
 * Handles creating and managing notifications for users
 */

import { prisma } from "@/server/db";

export type NotificationType =
  | "DISCOUNT_REQUEST"
  | "DISCOUNT_RESPONSE"
  | "BOOKING"
  | "PAYMENT"
  | "INVENTORY"
  | "SYSTEM";

interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(options: CreateNotificationOptions): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        userId: options.userId,
        type: options.type,
        title: options.title,
        message: options.message,
        link: options.link,
      },
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
  userIds: string[],
  options: Omit<CreateNotificationOptions, "userId">
): Promise<void> {
  try {
    await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type: options.type,
        title: options.title,
        message: options.message,
        link: options.link,
      })),
    });
  } catch (error) {
    console.error("Failed to create bulk notifications:", error);
  }
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  }
) {
  const where: any = { userId };

  if (options?.unreadOnly) {
    where.read = false;
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      select: {
        id: true,
        userId: true,
        type: true,
        title: true,
        message: true,
        link: true,
        read: true,
        bookingId: true,
        clientId: true,
        createdAt: true,
      },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { userId, read: false },
    }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    hasMore: total > (options?.offset || 0) + (options?.limit || 50),
  };
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  } catch (error) {
    console.error("Failed to mark notification as read:", error);
  }
}

/**
 * Mark multiple notifications as read
 */
export async function markNotificationsAsRead(notificationIds: string[]): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
      },
      data: { read: true },
    });
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  try {
    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  } catch (error) {
    console.error("Failed to mark all notifications as read:", error);
  }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });
  } catch (error) {
    console.error("Failed to delete notification:", error);
  }
}

/**
 * Delete all read notifications for a user
 */
export async function deleteReadNotifications(userId: string): Promise<void> {
  try {
    await prisma.notification.deleteMany({
      where: { userId, read: true },
    });
  } catch (error) {
    console.error("Failed to delete read notifications:", error);
  }
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: { userId, read: false },
    });
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return 0;
  }
}

// ============================================================================
// Notification Templates
// These functions create notifications with standard formatting
// ============================================================================

/**
 * Notify Owner about a new discount request
 */
export async function notifyDiscountRequest(
  ownerId: string,
  requestId: string,
  requesterName: string,
  bookingId: number,
  discountAmount: string
): Promise<void> {
  await createNotification({
    userId: ownerId,
    type: "DISCOUNT_REQUEST",
    title: "New Discount Request",
    message: `${requesterName} is requesting a ${discountAmount} discount for Booking #${bookingId}`,
    link: `/discount-requests/${requestId}`,
  });
}

/**
 * Notify requester about discount approval
 */
export async function notifyDiscountApproved(
  requesterId: string,
  requestId: string,
  bookingId: number,
  discountAmount: string
): Promise<void> {
  await createNotification({
    userId: requesterId,
    type: "DISCOUNT_RESPONSE",
    title: "Discount Approved",
    message: `Your ${discountAmount} discount request for Booking #${bookingId} has been approved`,
    link: `/bookings/${bookingId}`,
  });
}

/**
 * Notify requester about discount rejection
 */
export async function notifyDiscountRejected(
  requesterId: string,
  requestId: string,
  bookingId: number,
  discountAmount: string,
  reason?: string
): Promise<void> {
  const reasonText = reason ? `: ${reason}` : "";
  await createNotification({
    userId: requesterId,
    type: "DISCOUNT_RESPONSE",
    title: "Discount Rejected",
    message: `Your ${discountAmount} discount request for Booking #${bookingId} has been rejected${reasonText}`,
    link: `/bookings/${bookingId}`,
  });
}

/**
 * Notify requester about modified discount
 */
export async function notifyDiscountModified(
  requesterId: string,
  requestId: string,
  bookingId: number,
  originalAmount: string,
  modifiedAmount: string
): Promise<void> {
  await createNotification({
    userId: requesterId,
    type: "DISCOUNT_RESPONSE",
    title: "Discount Modified",
    message: `Your discount request for Booking #${bookingId} was adjusted from ${originalAmount} to ${modifiedAmount} and approved`,
    link: `/bookings/${bookingId}`,
  });
}

/**
 * Notify about a new booking
 */
export async function notifyNewBooking(
  userIds: string[],
  bookingId: number,
  clientName: string,
  eventDate: string
): Promise<void> {
  await createBulkNotifications(userIds, {
    type: "BOOKING",
    title: "New Booking Created",
    message: `New booking #${bookingId} for ${clientName} on ${eventDate}`,
    link: `/bookings/${bookingId}`,
  });
}

/**
 * Notify about booking cancellation
 */
export async function notifyBookingCancellation(
  userIds: string[],
  bookingId: number,
  clientName: string,
  eventDate: string
): Promise<void> {
  await createBulkNotifications(userIds, {
    type: "BOOKING",
    title: "Booking Cancelled",
    message: `Booking #${bookingId} for ${clientName} on ${eventDate} has been cancelled`,
    link: `/bookings/${bookingId}`,
  });
}

/**
 * Notify about payment received
 */
export async function notifyPaymentReceived(
  userIds: string[],
  bookingId: number,
  amount: number,
  clientName: string
): Promise<void> {
  await createBulkNotifications(userIds, {
    type: "PAYMENT",
    title: "Payment Received",
    message: `Received ₱${amount.toFixed(2)} payment from ${clientName} for Booking #${bookingId}`,
    link: `/bookings/${bookingId}`,
  });
}

/**
 * Notify about low inventory
 */
export async function notifyLowInventory(
  userIds: string[],
  itemName: string,
  currentStock: number,
  minStock: number
): Promise<void> {
  await createBulkNotifications(userIds, {
    type: "INVENTORY",
    title: "Low Inventory Alert",
    message: `${itemName} is running low (${currentStock}/${minStock})`,
    link: "/inventory",
  });
}

/**
 * Notify about system events
 */
export async function notifySystemEvent(
  userIds: string[],
  title: string,
  message: string,
  link?: string
): Promise<void> {
  await createBulkNotifications(userIds, {
    type: "SYSTEM",
    title,
    message,
    link,
  });
}
