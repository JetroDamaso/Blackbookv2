"use server";

import { prisma } from "@/server/db";

export async function createRoom(data: { name: string; capacity: number }) {
  try {
    const room = await prisma.rooms.create({
      data: {
        name: data.name,
        capacity: data.capacity,
      },
    });

    return room;
  } catch (error: any) {
    throw new Error("Failed to create room: " + error.message);
  }
}

export async function addRoomToBooking(bookingId: number, roomId: number) {
  try {
    const result = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        rooms: {
          connect: { id: roomId },
        },
      },
      include: {
        rooms: true,
      },
    });
    return result;
  } catch (error: any) {
    throw new Error("Failed to add room to booking: " + error.message);
  }
}

export async function removeRoomFromBooking(bookingId: number, roomId: number) {
  try {
    const result = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        rooms: {
          disconnect: { id: roomId },
        },
      },
      include: {
        rooms: true,
      },
    });
    return result;
  } catch (error: any) {
    throw new Error("Failed to remove room from booking: " + error.message);
  }
}

export async function setBookingRooms(bookingId: number, roomIds: number[]) {
  try {
    // First, disconnect all existing rooms
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        rooms: {
          set: [],
        },
      },
    });

    // Then connect the new rooms
    const result = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        rooms: {
          connect: roomIds.map(id => ({ id })),
        },
      },
      include: {
        rooms: true,
      },
    });
    return result;
  } catch (error: any) {
    throw new Error("Failed to set booking rooms: " + error.message);
  }
}
