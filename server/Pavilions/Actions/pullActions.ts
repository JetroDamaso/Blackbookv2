"use server";
import { prisma } from "@/server/db";

export async function getAllPavilions() {
  try {
    const data = await prisma.pavilion.findMany({
      orderBy: { maxPax: "desc" },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch pavilions", error);
    throw error;
  }
}

export async function getPavilionsById(id: number) {
  try {
    const data = await prisma.pavilion.findMany({
      where: { id },
    });

    return data;
  } catch (error) {
    console.error("Failed to fetch pavilions", error);

    throw error;
  }
}

export async function getAllPavilionsPaginated(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;
    const totalCount = await prisma.pavilion.count();
    const data = await prisma.pavilion.findMany({
      skip,
      take: pageSize,
      orderBy: { maxPax: "desc" },
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
    console.error("Failed to fetch paginated pavilions", error);
    throw error;
  }
}

export async function getPavilionStatistics() {
  try {
    // Get all pavilions with their bookings
    const pavilions = await prisma.pavilion.findMany({
      include: {
        bookings: true,
      },
    });

    // Get total count of active pavilions
    const totalPavilions = pavilions.filter(p => p.isActive).length;

    // Calculate total bookings across all pavilions
    const totalBookings = pavilions.reduce((sum, pavilion) => {
      return sum + pavilion.bookings.length;
    }, 0);

    // Calculate pavilion usage statistics
    const pavilionStats: Record<string, { count: number; percentage: number }> = {};

    pavilions.forEach(pavilion => {
      const bookingCount = pavilion.bookings.length;
      pavilionStats[pavilion.name] = {
        count: bookingCount,
        percentage: totalBookings > 0 ? Math.round((bookingCount / totalBookings) * 100) : 0,
      };
    });

    return {
      totalPavilions,
      totalBookings,
      pavilionStats,
    };
  } catch (error) {
    console.error("Failed to fetch pavilion statistics", error);
    throw error;
  }
}
