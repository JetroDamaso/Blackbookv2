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

export async function getAllClientsPaginated(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;

    // Get total count for pagination info
    const totalCount = await prisma.client.count();

    // Get paginated data
    const data = await prisma.client.findMany({
      skip,
      take: pageSize,
      include: {
        bookings: {
          include: {
            pavilion: true,
          },
        },
        payments: true,
      },
      orderBy: {
        id: "desc",
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
    console.error("Failed to fetch paginated clients", error);
    throw error;
  }
}
