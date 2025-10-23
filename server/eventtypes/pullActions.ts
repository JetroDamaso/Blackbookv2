"use server";
import { prisma } from "../db";

export async function getAllEventTypes() {
  try {
    const data = await prisma.eventTypes.findMany({
      include: {
        bookings: {
          select: {
            id: true,
            eventName: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all event types", error);
    throw error;
  }
}

export async function getEventTypeById(id: number) {
  try {
    const data = await prisma.eventTypes.findUnique({
      where: { id },
      include: {
        bookings: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch event type", error);
    throw error;
  }
}
