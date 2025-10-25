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
    // Get all bookings with billing data
    const bookings = await prisma.booking.findMany({
      include: {
        billing: true,
        category: true,
      },
    });

    // Calculate total revenue from all billings
    const totalRevenue = bookings.reduce((sum, booking) => {
      return sum + (booking.billing?.discountedPrice || 0);
    }, 0);

    // Get current year bookings for yearly revenue
    const currentYear = new Date().getFullYear();
    const yearlyBookings = bookings.filter(booking => {
      const bookingYear = booking.startAt ? new Date(booking.startAt).getFullYear() : 0;
      return bookingYear === currentYear;
    });

    const yearlyRevenue = yearlyBookings.reduce((sum, booking) => {
      return sum + (booking.billing?.discountedPrice || 0);
    }, 0);

    // Calculate monthly average (divide by 12)
    const monthlyAverage = yearlyRevenue / 12;

    // Calculate average bookings per month (total bookings / number of months since first booking)
    const oldestBooking = bookings.reduce((oldest, booking) => {
      if (!booking.startAt) return oldest;
      if (!oldest || new Date(booking.startAt) < new Date(oldest.startAt!)) {
        return booking;
      }
      return oldest;
    }, bookings[0]);

    let averageBookingsPerMonth = 0;
    if (oldestBooking && oldestBooking.startAt) {
      const monthsSinceFirstBooking = Math.ceil(
        (new Date().getTime() - new Date(oldestBooking.startAt).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      );
      averageBookingsPerMonth =
        monthsSinceFirstBooking > 0 ? bookings.length / monthsSinceFirstBooking : 0;
    }

    // Event type statistics
    const eventTypeStats: Record<string, { count: number; percentage: number }> = {};
    const totalBookings = bookings.length;

    bookings.forEach(booking => {
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
      totalBookings: bookings.length,
      yearlyRevenue,
      monthlyRevenueAverage: monthlyAverage,
      averageBookingsPerMonth: Math.round(averageBookingsPerMonth),
      eventTypeStats,
      totalRevenue,
    };
  } catch (error) {
    console.error("Failed to fetch booking statistics", error);
    throw error;
  }
}
