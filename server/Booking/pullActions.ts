"use server";
import { prisma } from "../db";

export async function getEventTypes(id: number) {
  try {
    const data = await prisma.eventTypes.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch event types", error);
    throw error;
  }
}

export async function getAllEventTypes() {
  try {
    return await prisma.eventTypes.findMany();
  } catch (error) {
    console.error("Failed to fetch all event types", error);
    throw error;
  }
}

export async function getAllBookings() {
  try {
    const data = await prisma.booking.findMany({
      include: {
        client: true,
        pavilion: true,
        billing: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    throw error;
  }
}

export async function getAllBookingsPaginated(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;

    // Get total count for pagination info
    const totalCount = await prisma.booking.count();

    // Get paginated data
    const data = await prisma.booking.findMany({
      skip,
      take: pageSize,
      include: {
        client: true,
        pavilion: true,
        billing: true,
      },
      orderBy: {
        startAt: "desc",
      },
    });

    return {
      data,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("Failed to fetch paginated bookings", error);
    throw error;
  }
}

export async function getOtherServicesCategory() {
  try {
    const data = await prisma.otherServiceCategory.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    throw error;
  }
}

export async function getBookingsById(id: number) {
  try {
    const data = await prisma.booking.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    throw error;
  }
}
