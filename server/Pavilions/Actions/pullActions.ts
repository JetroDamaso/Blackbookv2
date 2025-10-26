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
    // Use parallel queries for better performance
    const [totalPavilions, pavilionsWithBookings] = await Promise.all([
      // Count active pavilions - very fast
      prisma.pavilion.count({
        where: {
          isActive: true,
        },
      }),

      // Get pavilions with booking counts - only necessary fields
      prisma.pavilion.findMany({
        select: {
          name: true,
          _count: {
            select: {
              bookings: true,
            },
          },
        },
      }),
    ]);

    // Calculate total bookings across all pavilions
    const totalBookings = pavilionsWithBookings.reduce((sum, pavilion) => {
      return sum + pavilion._count.bookings;
    }, 0);

    // Calculate pavilion usage statistics
    const pavilionStats: Record<string, { count: number; percentage: number }> = {};

    pavilionsWithBookings.forEach(pavilion => {
      const bookingCount = pavilion._count.bookings;
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
