"use server";
import { prisma } from "../db";
import { calculateBookingStatus } from "./helpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  scheduleBookingNotifications,
  sendBookingCreatedNotifications,
} from "@/lib/notification-scheduler";

export async function createBooking(
  eventName: string,
  clientID: number,
  pavilionID: string,
  pax: string,
  eventType: number,
  notes: string,
  bookingStart: Date,
  bookingEnd: Date,
  serviceIds?: number[],
  packageId?: number,
  catering?: number
  //status: number
) {
  try {
    // Get the current session to track who created the booking
    const session = await getServerSession(authOptions);
    const createdById = session?.user?.id || null;

    // Validate required parameters
    if (!eventName || eventName.trim() === "") {
      throw new Error("Event name is required");
    }

    if (!clientID || isNaN(clientID) || clientID <= 0) {
      throw new Error("Valid client ID is required");
    }

    // Handle pavilionID - convert to number only if it's a valid string number
    let pavilionIdNumber: number | null = null;
    if (
      pavilionID &&
      pavilionID !== "" &&
      pavilionID !== "undefined" &&
      !isNaN(Number(pavilionID))
    ) {
      pavilionIdNumber = Number(pavilionID);
    }

    // Handle eventType - ensure it's a valid number or null
    let eventTypeNumber: number | null = null;
    if (eventType && !isNaN(eventType) && eventType > 0) {
      eventTypeNumber = eventType;
    }

    // Handle totalPax - ensure it's a valid positive number
    let totalPaxNumber = 1; // Default to 1 if not provided
    if (pax && pax !== "" && !isNaN(Number(pax)) && Number(pax) > 0) {
      totalPaxNumber = Number(pax);
    }

    const data = await prisma.booking.create({
      data: {
        eventName,
        clientId: clientID,
        pavilionId: pavilionIdNumber,
        eventType: eventTypeNumber,
        startAt: new Date(bookingStart),
        endAt: new Date(bookingEnd),
        foodTastingAt: null,
        totalPax: totalPaxNumber,
        themeMotif: null,
        status: 1,
        notes: notes || null,
        packageId: packageId || null,
        catering: catering || null,
        createdById: createdById,
        otherServices:
          serviceIds && serviceIds.length > 0
            ? {
                connect: serviceIds.filter(id => id && !isNaN(id)).map(id => ({ id })),
              }
            : undefined,
      },
    });

    // Schedule payment reminder notifications
    await scheduleBookingNotifications(data.id);

    // Send immediate booking creation notifications to managers and owners
    await sendBookingCreatedNotifications(data.id);

    return data;
  } catch (error) {
    console.error("Failed to create booking", error);
    throw error;
  }
}

export async function updateBooking(
  bookingId: number,
  eventName?: string,
  pavilionID?: string,
  pax?: string,
  eventType?: number,
  notes?: string,
  bookingStart?: Date,
  bookingEnd?: Date,
  status?: number,
  serviceIds?: number[],
  packageId?: string,
  catering?: number
) {
  try {
    // Handle pavilionID - convert to number only if it's a valid string number
    let pavilionIdNumber: number | null = null;
    if (
      pavilionID &&
      pavilionID !== "" &&
      pavilionID !== "undefined" &&
      !isNaN(Number(pavilionID))
    ) {
      pavilionIdNumber = Number(pavilionID);
    }

    // Handle eventType - ensure it's a valid number or null
    let eventTypeNumber: number | null = null;
    if (eventType && !isNaN(eventType) && eventType > 0) {
      eventTypeNumber = eventType;
    }

    // Handle totalPax - ensure it's a valid positive number
    let totalPaxNumber: number | undefined = undefined;
    if (pax && pax !== "" && !isNaN(Number(pax)) && Number(pax) > 0) {
      totalPaxNumber = Number(pax);
    }

    // Handle packageId - convert to number only if it's a valid string number
    let packageIdNumber: number | null = null;
    if (packageId && packageId !== "" && packageId !== "undefined" && !isNaN(Number(packageId))) {
      packageIdNumber = Number(packageId);
    }

    const updateData: any = {};

    if (eventName !== undefined) updateData.eventName = eventName;
    if (pavilionIdNumber !== null) updateData.pavilionId = pavilionIdNumber;
    if (eventTypeNumber !== null) updateData.eventType = eventTypeNumber;
    if (bookingStart) updateData.startAt = new Date(bookingStart);
    if (bookingEnd) updateData.endAt = new Date(bookingEnd);
    if (totalPaxNumber !== undefined) updateData.totalPax = totalPaxNumber;
    if (notes !== undefined) updateData.notes = notes || null;
    if (status !== undefined) updateData.status = status;
    if (packageIdNumber !== null) updateData.packageId = packageIdNumber;
    if (catering !== undefined) updateData.catering = catering;

    // Handle service connections if provided
    if (serviceIds !== undefined) {
      // First disconnect all existing services
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          otherServices: {
            set: [], // This removes all connections
          },
        },
      });

      // Then connect new services
      if (serviceIds.length > 0) {
        updateData.otherServices = {
          connect: serviceIds.filter(id => id && !isNaN(id)).map(id => ({ id })),
        };
      }
    }

    const data = await prisma.booking.update({
      where: { id: bookingId },
      data: updateData,
    });

    return data;
  } catch (error) {
    console.error("Failed to update booking", error);
    throw error;
  }
}

export async function updateBookingStatus(bookingId: number) {
  try {
    // Fetch booking with billing, payments, and additional charges
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        billing: {
          include: {
            payments: true,
          },
        },
        additionalCharges: true,
      },
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (!booking.startAt || !booking.endAt) {
      throw new Error("Booking must have start and end dates");
    }

    // Calculate payment status
    const billing = booking.billing; // This is now an object, not an array
    const hasPayments = billing?.payments && billing.payments.filter((p: any) => p.status !== "refunded" && p.amount > 0).length > 0;
    const totalPaid = billing?.payments?.filter((p: any) => p.status !== "refunded").reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

    // Calculate total billing including additional charges
    const additionalChargesTotal = booking.additionalCharges?.reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0;
    const totalBilling = (billing?.discountedPrice || 0) + additionalChargesTotal;
    const isFullyPaid = totalBilling > 0 ? totalPaid >= totalBilling : false;

    // Calculate new status
    const newStatus = calculateBookingStatus({
      hasPayments: hasPayments || false,
      isFullyPaid,
      eventStartDate: booking.startAt,
      eventEndDate: booking.endAt,
      currentStatus: booking.status, // Preserve manual statuses
    });

    // Update booking status if it changed
    if (booking.status !== newStatus) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: newStatus },
      });
    }

    return newStatus;
  } catch (error) {
    console.error("Failed to update booking status", error);
    throw error;
  }
}

export async function updateAllBookingStatuses() {
  try {
    // Fetch all bookings with billing, payments, and additional charges
    const bookings = await prisma.booking.findMany({
      where: {
        startAt: { not: null },
        endAt: { not: null },
      },
      include: {
        billing: {
          include: {
            payments: true,
          },
        },
        additionalCharges: true,
      },
    });

    let updatedCount = 0;

    for (const booking of bookings) {
      if (!booking.startAt || !booking.endAt) continue;

      const billing = booking.billing;
      const hasPayments = billing?.payments && billing.payments.filter((p: any) => p.status !== "refunded" && p.amount > 0).length > 0;
      const totalPaid = billing?.payments?.filter((p: any) => p.status !== "refunded").reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

      // Calculate total billing including additional charges
      const additionalChargesTotal = booking.additionalCharges?.reduce((sum: number, charge: any) => sum + charge.amount, 0) || 0;
      const totalBilling = (billing?.discountedPrice || 0) + additionalChargesTotal;
      const isFullyPaid = totalBilling > 0 ? totalPaid >= totalBilling : false;

      const newStatus = calculateBookingStatus({
        hasPayments: hasPayments || false,
        isFullyPaid,
        eventStartDate: booking.startAt,
        eventEndDate: booking.endAt,
        currentStatus: booking.status, // Preserve manual statuses
      });

      if (booking.status !== newStatus) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: newStatus },
        });
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  } catch (error) {
    console.error("Failed to update all booking statuses", error);
    throw error;
  }
}

/**
 * Archives bookings by setting their status to archived (status 5)
 * @param bookingIds - Array of booking IDs to archive
 * @returns Object with success status and count of archived bookings
 */
export async function archiveBookings(bookingIds: number[]) {
  try {
    const result = await prisma.booking.updateMany({
      where: {
        id: { in: bookingIds },
      },
      data: {
        status: 5, // Archived status
      },
    });
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to archive bookings", error);
    throw error;
  }
}

/**
 * Archives a single booking by setting its status to archived (status 5)
 * @param id - ID of the booking to archive
 * @returns The archived booking
 */
export async function archiveBooking(id: number) {
  try {
    const data = await prisma.booking.update({
      where: { id },
      data: { status: 5 }, // Archived status
    });
    return data;
  } catch (error) {
    console.error("Failed to archive booking", error);
    throw error;
  }
}

/**
 * Changes the status of multiple bookings
 * @param bookingIds - Array of booking IDs to update
 * @param newStatus - The new status to set (1-8)
 * @returns Updated bookings count
 */
export async function changeBookingsStatus(bookingIds: number[], newStatus: number) {
  try {
    const result = await prisma.booking.updateMany({
      where: {
        id: { in: bookingIds },
      },
      data: { status: newStatus },
    });
    return result;
  } catch (error) {
    console.error("Failed to change bookings status", error);
    throw error;
  }
}
