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
    if (pavilionID && pavilionID !== "" && pavilionID !== "undefined" && !isNaN(Number(pavilionID))) {
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
                connect: serviceIds.filter(id => id && !isNaN(id)).map((id) => ({ id })),
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
