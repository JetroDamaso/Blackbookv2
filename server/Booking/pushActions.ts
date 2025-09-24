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
    const data = await prisma.booking.create({
      data: {
        eventName,
        clientId: clientID,
        pavilionId: Number(pavilionID),
        eventType: eventType, // Default event type ID
        startAt: new Date(bookingStart),
        endAt: new Date(bookingEnd),
        foodTastingAt: null,
        totalPax: Number(pax),
        themeMotif: null,
        status: 1,
        notes: notes,
        packageId: packageId,
        catering: catering,
        otherServices:
          serviceIds && serviceIds.length
            ? {
                connect: serviceIds.map((id) => ({ id })),
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
