"use server";
import { prisma } from "../db";

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
        otherServices:
          serviceIds && serviceIds.length > 0
            ? {
                connect: serviceIds.filter(id => id && !isNaN(id)).map(id => ({ id })),
              }
            : undefined,
      },
    });
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
  packageId?: string
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
