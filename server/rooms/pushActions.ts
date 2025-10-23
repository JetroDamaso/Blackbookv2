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
