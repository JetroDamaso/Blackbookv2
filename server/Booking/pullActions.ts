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
      where: {
        status: { not: 5 }, // Exclude archived bookings (status 5)
      },
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
    const where = { status: { not: 5 } }; // Exclude archived bookings

    // Get total count for pagination info
    const totalCount = await prisma.booking.count({ where });

    // Get paginated data
    const data = await prisma.booking.findMany({
      where,
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
    const where = { status: { not: 5 } }; // Exclude archived bookings

    // Use aggregation and parallel queries for better performance
    const [totalBookings, yearlyBookings, oldestBooking, allBookingsForStats, activeBookings] =
      await Promise.all([
        // Total count - very fast
        prisma.booking.count({ where }),

        // Yearly bookings with billing - filtered at DB level
        prisma.booking.findMany({
          where: {
            status: { not: 5 }, // Exclude archived
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
            status: { not: 5 }, // Exclude archived
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
          where: {
            status: { not: 5 }, // Exclude archived
          },
          select: {
            eventType: true,
            category: {
              select: {
                name: true,
              },
            },
          },
        }),

        // Active bookings count (Pending, Confirmed, In Progress)
        prisma.booking.count({
          where: {
            status: {
              in: [1, 2, 3], // 1=Pending, 2=Confirmed, 3=In Progress
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
      activeBookings,
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
