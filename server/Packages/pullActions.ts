"use server";
import { prisma } from "../db";

export async function getAllPackages() {
  try {
    const data = await prisma.package.findMany({
      include: {
        pavilion: true,
        services: true,
        Booking: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch packages", error);
    throw error;
  }
}

export async function getPackagesById(id: number) {
  try {
    const data = await prisma.package.findMany({
      where: { id },
      include: {
        pavilion: true,
        services: true,
        Booking: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch packages", error);
    throw error;
  }
}

export async function getPackagesByPavilion(pavilionId: number) {
  try {
    const data = await prisma.package.findMany({
      where: { pavilionId },
      include: {
        pavilion: true,
        services: true,
        Booking: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch packages by pavilion", error);
    throw error;
  }
}
