/**
 * Report Types and Interfaces
 * Defines the structure for all report-related data
 */

export type ReportType =
  | "monthly"
  | "yearly"
  | "dateRange"
  | "status"
  | "selected"
  | "venue"
  | "eventType"
  | "client";

export interface ReportParams {
  reportType: ReportType;

  // Date filters
  year?: number;
  month?: number; // 1-12
  startDate?: Date;
  endDate?: Date;

  // Selection filters
  bookingIds?: string[];
  statuses?: string[];
  venueIds?: string[];
  eventTypeIds?: string[];
  clientIds?: string[];
}

export interface ReportMetadata {
  reportType: string;
  generatedAt: Date;
  dateRange: {
    start: Date;
    end: Date;
    description: string;
  };
  filters: {
    statuses?: string[];
    venues?: string[];
    eventTypes?: string[];
    clients?: string[];
    bookingIds?: string[];
  };
}

export interface ReportSummary {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  cancellationRate: number;
}

export interface BookingBreakdown {
  byStatus: Record<string, number>;
  byVenue: Record<string, number>;
  byEventType: Record<string, number>;
}

export interface FinancialBreakdown {
  totalRevenue: number;
  revenueByVenue: Record<string, number>;
  revenueByMonth?: Record<string, number>;
  paymentsCollected: number;
  outstandingBalance: number;
  overduePayments: number;
  discountsGiven: {
    total: number;
    byType: Record<string, number>;
  };
}

export interface ClientStats {
  totalClients: number;
  newClients: number;
  returningClients: number;
  topClients: Array<{
    id: string;
    name: string;
    totalSpent: number;
    bookingCount: number;
  }>;
}

export interface BookingDetail {
  id: string;
  eventDate: Date;
  status: string;
  venue: string;
  eventType: string;
  client: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
}

export interface InventoryStats {
  totalCheckouts: number;
  damagedItems: number;
  missingItems: number;
}

export interface Report {
  metadata: ReportMetadata;
  summary: ReportSummary;
  bookingBreakdown: BookingBreakdown;
  financialBreakdown: FinancialBreakdown;
  clientStats: ClientStats;
  bookings: BookingDetail[];
  inventoryStats?: InventoryStats;
}

export interface MonthlyData {
  month: string;
  bookings: number;
  revenue: number;
  averageValue: number;
}
