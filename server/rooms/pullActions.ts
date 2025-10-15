"use server";
import { prisma } from "../db";

export async function getAllRooms() {
  try {
    const data = await prisma.rooms.findMany({
      include: {
        Booking: {
          select: {
            id: true,
            eventName: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all rooms", error);
    throw error;
  }
}

export async function getRoomById(id: number) {
  try {
    const data = await prisma.rooms.findUnique({
      where: { id },
      include: {
        Booking: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch room", error);
    throw error;
  }
}
