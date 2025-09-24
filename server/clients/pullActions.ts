"use server";
import { prisma } from "../db";

export async function getClientsById(id: number) {
  try {
    const data = await prisma.client.findUnique({
      where: { id },
      include: { bookings: true },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch client", error);
    throw error;
  }
}
