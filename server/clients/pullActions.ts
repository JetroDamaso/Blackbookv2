"use server";
import { prisma } from "../db";

export async function getAllClients() {
  try {
    const data = await prisma.client.findMany({
      include: {
        bookings: {
          include: {
            pavilion: true,
          },
        },
        payments: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch all clients", error);
    throw error;
  }
}

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
