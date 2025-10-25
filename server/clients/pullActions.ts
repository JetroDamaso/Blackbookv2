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

export async function getClientStatistics() {
  try {
    // Get all clients with their bookings
    const clients = await prisma.client.findMany({
      include: {
        bookings: {
          include: {
            category: true,
          },
        },
      },
    });

    const totalClients = clients.length;

    // Calculate new clients per month (clients from current month)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const newClientsThisMonth = clients.filter(client => {
      const createdDate = new Date(client.dateCreated);
      return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
    }).length;

    // Calculate average new clients per month
    const oldestClient = clients.reduce((oldest, client) => {
      if (!oldest || new Date(client.dateCreated) < new Date(oldest.dateCreated)) {
        return client;
      }
      return oldest;
    }, clients[0]);

    let averageNewClientsPerMonth = 0;
    if (oldestClient) {
      const monthsSinceFirstClient = Math.ceil(
        (currentDate.getTime() - new Date(oldestClient.dateCreated).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      );
      averageNewClientsPerMonth =
        monthsSinceFirstClient > 0 ? totalClients / monthsSinceFirstClient : 0;
    }

    // Event type statistics based on client bookings
    const eventTypeStats: Record<string, { count: number; percentage: number }> = {};

    // Count unique clients per event type
    const clientEventTypes = new Map<number, Set<string>>();

    clients.forEach(client => {
      client.bookings.forEach(booking => {
        const eventTypeName = booking.category?.name || "Unknown";
        if (!clientEventTypes.has(client.id)) {
          clientEventTypes.set(client.id, new Set());
        }
        clientEventTypes.get(client.id)?.add(eventTypeName);
      });
    });

    // Count clients for each event type
    clientEventTypes.forEach(eventTypes => {
      eventTypes.forEach(eventType => {
        if (!eventTypeStats[eventType]) {
          eventTypeStats[eventType] = { count: 0, percentage: 0 };
        }
        eventTypeStats[eventType].count++;
      });
    });

    // Calculate percentages
    Object.keys(eventTypeStats).forEach(eventType => {
      eventTypeStats[eventType].percentage =
        totalClients > 0 ? Math.round((eventTypeStats[eventType].count / totalClients) * 100) : 0;
    });

    return {
      totalClients,
      newClientsThisMonth,
      averageNewClientsPerMonth: Math.round(averageNewClientsPerMonth),
      eventTypeStats,
    };
  } catch (error) {
    console.error("Failed to fetch client statistics", error);
    throw error;
  }
}
