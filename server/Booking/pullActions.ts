
import { prisma } from "../db";

export async function getEventTypes() {
  try {
    const data = await prisma.eventTypes.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch event types", error);
    throw error;
  }
}
