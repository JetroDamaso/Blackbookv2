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
  };
}

/**
 * Calculate summary statistics
 */
function calculateSummary(bookings: any[]) {
  const totalBookings = bookings.length;

  // Only include Confirmed (2), Completed (4), and Unpaid (5) bookings in revenue calculation
  const revenueBookings = bookings.filter(b => b.status === 2 || b.status === 4 || b.status === 5);
  const totalRevenue = revenueBookings.reduce((sum, b) => sum + (b.billing?.originalPrice || 0), 0);
  const averageBookingValue = safeDivide(totalRevenue, totalBookings);

  const cancelledCount = bookings.filter(b => b.status === 6).length; // Status 6 = Cancelled
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

  // Status mapping (actual status values in the database)
  const statusMap: Record<number, string> = {
    1: "Pending",
    2: "Confirmed",
    3: "In Progress",
    4: "Completed",
    5: "Unpaid",
    6: "Cancelled",
    7: "Archived",
  };

  bookings.forEach(booking => {
    // By Status - Override "In Progress" based on payment status
    let statusName = statusMap[booking.status] || "Unknown";

    if (booking.status === 3) { // Status 3 = In Progress
      const totalAmount = booking.billing?.originalPrice || 0;
      const balance = booking.billing?.balance || 0;

      if (balance === 0 && totalAmount > 0) {
        statusName = "Completed"; // Full payment received
      } else if (balance > 0) {
        statusName = "Unpaid"; // Still has balance
      }
    }

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
  // Only include Confirmed (2), Completed (4), and Unpaid (5) bookings in revenue calculation
  const revenueBookings = bookings.filter(b => b.status === 2 || b.status === 4 || b.status === 5);
  const totalRevenue = revenueBookings.reduce((sum, b) => sum + (b.billing?.originalPrice || 0), 0);

  // Revenue by venue - only for revenue bookings
  const revenueByVenue: Record<string, number> = {};
  revenueBookings.forEach(booking => {
    const venueName = booking.pavilion?.name || "No Venue";
    const revenue = booking.billing?.originalPrice || 0;
    revenueByVenue[venueName] = (revenueByVenue[venueName] || 0) + revenue;
  });

  // Payment statistics - exclude refunded payments (use all bookings for payment tracking)
  const paymentsCollected = bookings.reduce((sum, b) => {
    const payments = b.billing?.payments || [];
    const validPayments = payments
      .filter((p: any) => p.status?.toLowerCase() !== 'refunded')
      .reduce((pSum: number, p: any) => pSum + p.amount, 0);
    return sum + validPayments;
  }, 0);

  // Calculate outstanding balance - only for Confirmed (2), Completed (4), and Unpaid (5) bookings
  const outstandingBalance = revenueBookings.reduce((sum, b) => {
    const totalAmount = b.billing?.originalPrice || 0;
    const payments = b.billing?.payments || [];
    const paidAmount = payments
      .filter((p: any) => p.status?.toLowerCase() !== 'refunded')
      .reduce((pSum: number, p: any) => pSum + p.amount, 0);
    const balance = Math.max(0, totalAmount - paidAmount);
    return sum + balance;
  }, 0);

  // Overdue payments (bookings with balance and past event date) - only for revenue bookings
  const now = new Date();
  const overduePayments = revenueBookings.filter(b => {
    const totalAmount = b.billing?.originalPrice || 0;
    const payments = b.billing?.payments || [];
    const paidAmount = payments
      .filter((p: any) => p.status?.toLowerCase() !== 'refunded')
      .reduce((pSum: number, p: any) => pSum + p.amount, 0);
    const balance = totalAmount - paidAmount;
    const hasBalance = balance > 0;
    const isPastEvent = b.startAt && b.startAt < now;
    return hasBalance && isPastEvent;
  }).length;

  // Discount statistics - only for Confirmed (2), Completed (4), and Unpaid (5) bookings
  const discountsData = revenueBookings.map(b => ({
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

    // Only sum payments that are not refunded (exclude status "refunded" or "REFUNDED")
    const paidAmount = payments
      .filter((p: any) => p.status?.toLowerCase() !== 'refunded')
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    // Calculate actual balance: totalAmount - paidAmount
    const balance = Math.max(0, totalAmount - paidAmount);

    // Override status for "In Progress" bookings based on payment status
    let displayStatus = getStatusName(booking.status);
    if (booking.status === 3) { // Status 3 = In Progress
      if (balance === 0 && totalAmount > 0) {
        displayStatus = "Completed"; // Full payment received
      } else if (balance > 0) {
        displayStatus = "Unpaid"; // Still has balance
      }
    }

    return {
      id: booking.id.toString(),
      eventDate: booking.startAt || new Date(),
      eventName: booking.eventName || "No Event Name",
      status: displayStatus,
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
    1: "Pending",
    2: "Confirmed",
    3: "In Progress",
    4: "Completed",
    5: "Unpaid",
    6: "Cancelled",
    7: "Archived",
  };
  return statusMap[status] || "Unknown";
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
