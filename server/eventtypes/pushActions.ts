"use server";

import { prisma } from "@/server/db";

export async function createEventType(data: { name: string }) {
  try {
    const eventType = await prisma.eventTypes.create({
      data: {
        name: data.name,
      },
    });

    return eventType;
  } catch (error: any) {
    throw new Error("Failed to create event type: " + error.message);
  }
}

export async function deleteEventType(id: number) {
  try {
    const data = await prisma.eventTypes.update({
      where: { id },
      data: { isDeleted: true },
    });
    return data;
  } catch (error: any) {
    throw new Error("Failed to delete event type: " + error.message);
  }
}
