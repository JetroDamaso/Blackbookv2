"use server";
import { prisma } from "../db";

export async function getEventTypes(id: number) {
  try {
    const data = await prisma.eventTypes.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch event types", error);
    throw error;
  }
}

export async function getAllEventTypes() {
  try {
    return await prisma.eventTypes.findMany();
  } catch (error) {
    console.error("Failed to fetch all event types", error);
    throw error;
  }
}

export async function getAllBookings() {
  try {
    const data = await prisma.booking.findMany({
      include: {
        client: true,
        pavilion: true,
        billing: true,
      },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    throw error;
  }
}

export async function getAllBookingsPaginated(page: number = 1, pageSize: number = 10) {
  try {
    const skip = (page - 1) * pageSize;

    // Get total count for pagination info
    const totalCount = await prisma.booking.count();

    // Get paginated data
    const data = await prisma.booking.findMany({
      skip,
      take: pageSize,
      include: {
        client: true,
        pavilion: true,
        billing: true,
      },
      orderBy: {
        startAt: "desc",
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
    console.error("Failed to fetch paginated bookings", error);
    throw error;
  }
}

export async function getOtherServicesCategory() {
  try {
    const data = await prisma.otherServiceCategory.findMany();
    return data;
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    throw error;
  }
}

export async function getBookingsById(id: number) {
  try {
    const data = await prisma.booking.findMany({
      where: { id },
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch bookings", error);
    throw error;
  }
}

export async function getBookingStatistics() {
  try {
    const currentYear = new Date().getFullYear();
    const currentYearStart = new Date(currentYear, 0, 1);

    // Use aggregation and parallel queries for better performance
    const [totalBookings, yearlyBookings, oldestBooking, allBookingsForStats] = await Promise.all([
      // Total count - very fast
      prisma.booking.count(),

      // Yearly bookings with billing - filtered at DB level
      prisma.booking.findMany({
        where: {
          startAt: {
            gte: currentYearStart,
          },
        },
        select: {
          billing: {
            select: {
              discountedPrice: true,
            },
          },
        },
      }),

      // Oldest booking - only get what we need
      prisma.booking.findFirst({
        where: {
          startAt: {
            not: null,
          },
        },
        select: {
          startAt: true,
        },
        orderBy: {
          startAt: "asc",
        },
      }),

      // Get bookings with event types - only necessary fields
      prisma.booking.findMany({
        select: {
          eventType: true,
          category: {
            select: {
              name: true,
            },
          },
        },
      }),
    ]);

    // Calculate yearly revenue
    const yearlyRevenue = yearlyBookings.reduce((sum, booking) => {
      return sum + (booking.billing?.discountedPrice || 0);
    }, 0);

    const monthlyAverage = yearlyRevenue / 12;

    // Calculate average bookings per month
    let averageBookingsPerMonth = 0;
    if (oldestBooking?.startAt) {
      const monthsSinceFirstBooking = Math.ceil(
        (new Date().getTime() - new Date(oldestBooking.startAt).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      );
      averageBookingsPerMonth =
        monthsSinceFirstBooking > 0 ? totalBookings / monthsSinceFirstBooking : 0;
    }

    // Build event type statistics
    const eventTypeStats: Record<string, { count: number; percentage: number }> = {};

    allBookingsForStats.forEach(booking => {
      const eventTypeName = booking.category?.name || "Unknown";
      if (!eventTypeStats[eventTypeName]) {
        eventTypeStats[eventTypeName] = { count: 0, percentage: 0 };
      }
      eventTypeStats[eventTypeName].count++;
    });

    // Calculate percentages
    Object.keys(eventTypeStats).forEach(eventType => {
      eventTypeStats[eventType].percentage =
        totalBookings > 0 ? Math.round((eventTypeStats[eventType].count / totalBookings) * 100) : 0;
    });

    return {
      totalBookings,
      yearlyRevenue,
      monthlyRevenueAverage: monthlyAverage,
      averageBookingsPerMonth: Math.round(averageBookingsPerMonth),
      eventTypeStats,
    };
  } catch (error) {
    console.error("Failed to fetch booking statistics", error);
    throw error;
  }
}
