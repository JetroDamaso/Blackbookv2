/**
 * Report Generation Functions
 * Core logic for generating various types of reports
 */

import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  format,
} from "date-fns";
import { prisma } from "@/server/db";
import type { ReportParams, Report, BookingDetail, MonthlyData } from "./types";
import {
  getDateRangeForQuery,
  getDateRangeDescription,
  safeDivide,
  roundToTwo,
  calculatePercentage,
} from "./utils";

/**
 * Main report generator - routes to specific functions based on reportType
 */
export async function generateReport(params: ReportParams): Promise<Report> {
  switch (params.reportType) {
    case "monthly":
      return generateMonthlyReport(params.year!, params.month!);

    case "yearly":
      return generateYearlyReport(params.year!);

    case "dateRange":
      return generateDateRangeReport(params.startDate!, params.endDate!);

    case "status":
      return generateStatusReport(params.statuses!, params.startDate, params.endDate);

    case "selected":
      return generateSelectedBookingsReport(params.bookingIds!);

    case "venue":
      return generateVenueReport(params.venueIds!, params.startDate!, params.endDate!);

    case "eventType":
      return generateEventTypeReport(params.eventTypeIds!, params.startDate!, params.endDate!);

    case "client":
      return generateClientReport(params.clientIds!, params.startDate, params.endDate);

    default:
      throw new Error(`Unknown report type: ${params.reportType}`);
  }
}

/**
 * Generate monthly report
 */
export async function generateMonthlyReport(year: number, month: number): Promise<Report> {
  const monthDate = new Date(year, month - 1, 1);
  const startDate = startOfMonth(monthDate);
  const endDate = endOfMonth(monthDate);

  const bookings = await getBookings({
    startAt: {
      gte: startDate,
      lte: endDate,
    },
  });

  return await buildReport(
    {
      reportType: "monthly",
      year,
      month,
    },
    bookings,
    startDate,
    endDate
  );
}

/**
 * Generate yearly report
 */
export async function generateYearlyReport(year: number): Promise<Report> {
  const yearDate = new Date(year, 0, 1);
  const startDate = startOfYear(yearDate);
  const endDate = endOfYear(yearDate);

  const bookings = await getBookings({
    startAt: {
      gte: startDate,
      lte: endDate,
    },
  });

  const report = await buildReport(
    {
      reportType: "yearly",
      year,
    },
    bookings,
    startDate,
    endDate
  );

  // Add monthly breakdown for yearly reports
  const monthlyBreakdown = await generateMonthlyBreakdown(year, bookings);
  report.financialBreakdown.revenueByMonth = monthlyBreakdown;

  return report;
}

/**
 * Generate date range report
 */
export async function generateDateRangeReport(startDate: Date, endDate: Date): Promise<Report> {
  const bookings = await getBookings({
    startAt: {
      gte: startDate,
      lte: endDate,
    },
  });

  return await buildReport(
    {
      reportType: "dateRange",
      startDate,
      endDate,
    },
    bookings,
    startDate,
    endDate
  );
}

/**
 * Generate booking status report
 */
export async function generateStatusReport(
  statuses: string[],
  startDate?: Date,
  endDate?: Date
): Promise<Report> {
  const where: any = {
    status: {
      in: statuses.map(s => parseInt(s)),
    },
  };

  if (startDate && endDate) {
    where.startAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const bookings = await getBookings(where);

  const actualStartDate = startDate || new Date(0);
  const actualEndDate = endDate || new Date();

  return await buildReport(
    {
      reportType: "status",
      statuses,
      startDate,
      endDate,
    },
    bookings,
    actualStartDate,
    actualEndDate
  );
}

/**
 * Generate selected bookings report
 */
export async function generateSelectedBookingsReport(bookingIds: string[]): Promise<Report> {
  const bookings = await getBookings({
    id: {
      in: bookingIds.map(id => parseInt(id)),
    },
  });

  // Get date range from selected bookings
  const dates = bookings.map(b => b.startAt).filter(Boolean) as Date[];
  const startDate =
    dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : new Date();
  const endDate =
    dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : new Date();

  return await buildReport(
    {
      reportType: "selected",
      bookingIds,
    },
    bookings,
    startDate,
    endDate
  );
}

/**
 * Generate venue report
 */
export async function generateVenueReport(
  venueIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Report> {
  const bookings = await getBookings({
    pavilionId: {
      in: venueIds.map(id => parseInt(id)),
    },
    startAt: {
      gte: startDate,
      lte: endDate,
    },
  });

  return await buildReport(
    {
      reportType: "venue",
      venueIds,
      startDate,
      endDate,
    },
    bookings,
    startDate,
    endDate
  );
}

/**
 * Generate event type report
 */
export async function generateEventTypeReport(
  eventTypeIds: string[],
  startDate: Date,
  endDate: Date
): Promise<Report> {
  const bookings = await getBookings({
    eventType: {
      in: eventTypeIds.map(id => parseInt(id)),
    },
    startAt: {
      gte: startDate,
      lte: endDate,
    },
  });

  return await buildReport(
    {
      reportType: "eventType",
      eventTypeIds,
      startDate,
      endDate,
    },
    bookings,
    startDate,
    endDate
  );
}

/**
 * Generate client report
 */
export async function generateClientReport(
  clientIds: string[],
  startDate?: Date,
  endDate?: Date
): Promise<Report> {
  const where: any = {
    clientId: {
      in: clientIds.map(id => parseInt(id)),
    },
  };

  if (startDate && endDate) {
    where.startAt = {
      gte: startDate,
      lte: endDate,
    };
  }

  const bookings = await getBookings(where);

  const actualStartDate = startDate || new Date(0);
  const actualEndDate = endDate || new Date();

  return await buildReport(
    {
      reportType: "client",
      clientIds,
      startDate,
      endDate,
    },
    bookings,
    actualStartDate,
    actualEndDate
  );
}

/**
 * Fetch bookings with all necessary relations
 */
async function getBookings(where: any): Promise<any[]> {
  return await prisma.booking.findMany({
    where,
    include: {
      client: true,
      pavilion: true,
      category: true,
      package: true,
      billing: {
        include: {
          payments: true,
        },
      },
      inventoryStatuses: {
        include: {
          inventory: true,
        },
      },
    },
    orderBy: {
      startAt: "desc",
    },
  });
}

/**
 * Build complete report from bookings data
 */
async function buildReport(
  params: ReportParams,
  bookings: any[],
  startDate: Date,
  endDate: Date
): Promise<Report> {
  const summary = calculateSummary(bookings);
  const bookingBreakdown = calculateBookingBreakdown(bookings);
  const financialBreakdown = await calculateFinancialBreakdown(bookings, startDate, endDate);
  const clientStats = await calculateClientStats(bookings, startDate, endDate);
  const bookingDetails = mapBookingDetails(bookings);
  const inventoryStats = calculateInventoryStats(bookings);

  return {
    metadata: {
      reportType: params.reportType,
      generatedAt: new Date(),
      dateRange: {
        start: startDate,
        end: endDate,
        description: getDateRangeDescription(params),
      },
      filters: {
        statuses: params.statuses,
        venues: params.venueIds,
        eventTypes: params.eventTypeIds,
        clients: params.clientIds,
        bookingIds: params.bookingIds,
      },
    },
    summary,
    bookingBreakdown,
    financialBreakdown,
    clientStats,
    bookings: bookingDetails,
    inventoryStats,
  };
}

/**
 * Calculate summary statistics
 */
function calculateSummary(bookings: any[]) {
  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.billing?.originalPrice || 0), 0);
  const averageBookingValue = safeDivide(totalRevenue, totalBookings);

  const cancelledCount = bookings.filter(b => b.status === 3).length; // Assuming 3 = Cancelled
  const cancellationRate = calculatePercentage(cancelledCount, totalBookings);

  return {
    totalBookings,
    totalRevenue: roundToTwo(totalRevenue),
    averageBookingValue: roundToTwo(averageBookingValue),
    cancellationRate: roundToTwo(cancellationRate),
  };
}

/**
 * Calculate booking breakdown by status, venue, and event type
 */
function calculateBookingBreakdown(bookings: any[]) {
  const byStatus: Record<string, number> = {};
  const byVenue: Record<string, number> = {};
  const byEventType: Record<string, number> = {};

  // Status mapping (adjust based on your actual status values)
  const statusMap: Record<number, string> = {
    0: "Pending",
    1: "Confirmed",
    2: "Completed",
    3: "Cancelled",
  };

  bookings.forEach(booking => {
    // By Status
    const statusName = statusMap[booking.status] || "Unknown";
    byStatus[statusName] = (byStatus[statusName] || 0) + 1;

    // By Venue
    const venueName = booking.pavilion?.name || "No Venue";
    byVenue[venueName] = (byVenue[venueName] || 0) + 1;

    // By Event Type
    const eventTypeName = booking.category?.name || "No Type";
    byEventType[eventTypeName] = (byEventType[eventTypeName] || 0) + 1;
  });

  return {
    byStatus,
    byVenue,
    byEventType,
  };
}

/**
 * Calculate financial breakdown
 */
async function calculateFinancialBreakdown(bookings: any[], startDate: Date, endDate: Date) {
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.billing?.originalPrice || 0), 0);

  // Revenue by venue
  const revenueByVenue: Record<string, number> = {};
  bookings.forEach(booking => {
    const venueName = booking.pavilion?.name || "No Venue";
    const revenue = booking.billing?.originalPrice || 0;
    revenueByVenue[venueName] = (revenueByVenue[venueName] || 0) + revenue;
  });

  // Payment statistics
  const paymentsCollected = bookings.reduce((sum, b) => {
    const payments = b.billing?.payments || [];
    return sum + payments.reduce((pSum: number, p: any) => pSum + p.amount, 0);
  }, 0);

  const outstandingBalance = bookings.reduce((sum, b) => sum + (b.billing?.balance || 0), 0);

  // Overdue payments (bookings with balance and past event date)
  const now = new Date();
  const overduePayments = bookings.filter(b => {
    const hasBalance = (b.billing?.balance || 0) > 0;
    const isPastEvent = b.startAt && b.startAt < now;
    return hasBalance && isPastEvent;
  }).length;

  // Discount statistics
  const discountsData = bookings.map(b => ({
    type: b.billing?.discountType || "None",
    amount: b.billing?.discountAmount || 0,
  }));

  const totalDiscounts = discountsData.reduce((sum, d) => sum + d.amount, 0);

  const discountsByType: Record<string, number> = {};
  discountsData.forEach(d => {
    if (d.amount > 0) {
      discountsByType[d.type] = (discountsByType[d.type] || 0) + d.amount;
    }
  });

  return {
    totalRevenue: roundToTwo(totalRevenue),
    revenueByVenue: Object.fromEntries(
      Object.entries(revenueByVenue).map(([k, v]) => [k, roundToTwo(v)])
    ),
    paymentsCollected: roundToTwo(paymentsCollected),
    outstandingBalance: roundToTwo(outstandingBalance),
    overduePayments,
    discountsGiven: {
      total: roundToTwo(totalDiscounts),
      byType: Object.fromEntries(
        Object.entries(discountsByType).map(([k, v]) => [k, roundToTwo(v)])
      ),
    },
  };
}

/**
 * Calculate client statistics
 */
async function calculateClientStats(bookings: any[], startDate: Date, endDate: Date) {
  const uniqueClientIds = new Set(bookings.map(b => b.clientId).filter(Boolean));
  const totalClients = uniqueClientIds.size;

  // Get new clients (created during the date range)
  const newClients = await prisma.client.count({
    where: {
      dateCreated: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  const returningClients = totalClients - newClients;

  // Top clients by revenue
  const clientRevenue: Record<number, { name: string; revenue: number; bookingCount: number }> = {};

  bookings.forEach(booking => {
    if (booking.clientId && booking.client) {
      if (!clientRevenue[booking.clientId]) {
        clientRevenue[booking.clientId] = {
          name: `${booking.client.firstName} ${booking.client.lastName}`,
          revenue: 0,
          bookingCount: 0,
        };
      }
      clientRevenue[booking.clientId].revenue += booking.billing?.originalPrice || 0;
      clientRevenue[booking.clientId].bookingCount += 1;
    }
  });

  const topClients = Object.entries(clientRevenue)
    .map(([id, data]) => ({
      id,
      name: data.name,
      totalSpent: roundToTwo(data.revenue),
      bookingCount: data.bookingCount,
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  return {
    totalClients,
    newClients,
    returningClients: Math.max(0, returningClients),
    topClients,
  };
}

/**
 * Map bookings to booking details format
 */
function mapBookingDetails(bookings: any[]): BookingDetail[] {
  return bookings.map(booking => {
    const totalAmount = booking.billing?.originalPrice || 0;
    const payments = booking.billing?.payments || [];
    const paidAmount = payments.reduce((sum: number, p: any) => sum + p.amount, 0);
    const balance = booking.billing?.balance || 0;

    return {
      id: booking.id.toString(),
      eventDate: booking.startAt || new Date(),
      status: getStatusName(booking.status),
      venue: booking.pavilion?.name || "No Venue",
      eventType: booking.category?.name || "No Type",
      client: booking.client
        ? `${booking.client.firstName} ${booking.client.lastName}`
        : "No Client",
      totalAmount: roundToTwo(totalAmount),
      paidAmount: roundToTwo(paidAmount),
      balance: roundToTwo(balance),
    };
  });
}

/**
 * Get status name from status code
 */
function getStatusName(status: number): string {
  const statusMap: Record<number, string> = {
    0: "Pending",
    1: "Confirmed",
    2: "Completed",
    3: "Cancelled",
  };
  return statusMap[status] || "Unknown";
}

/**
 * Calculate inventory statistics
 */
function calculateInventoryStats(bookings: any[]) {
  let totalCheckouts = 0;
  let damagedItems = 0;
  let missingItems = 0;

  bookings.forEach(booking => {
    const items = booking.inventoryStatuses || [];
    totalCheckouts += items.length;

    // You may need to add fields to track damaged/missing items in your schema
    // For now, returning zeros
  });

  return {
    totalCheckouts,
    damagedItems,
    missingItems,
  };
}

/**
 * Generate monthly breakdown for yearly reports
 */
async function generateMonthlyBreakdown(
  year: number,
  bookings: any[]
): Promise<Record<string, number>> {
  const monthlyRevenue: Record<string, number> = {};

  for (let month = 1; month <= 12; month++) {
    const monthDate = new Date(year, month - 1, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const monthBookings = bookings.filter(b => {
      if (!b.startAt) return false;
      return b.startAt >= monthStart && b.startAt <= monthEnd;
    });

    const revenue = monthBookings.reduce((sum, b) => sum + (b.billing?.originalPrice || 0), 0);
    const monthName = format(monthDate, "MMMM");
    monthlyRevenue[monthName] = roundToTwo(revenue);
  }

  return monthlyRevenue;
}
