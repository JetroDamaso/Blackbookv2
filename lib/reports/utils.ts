/**
 * Report Utility Functions
 * Helper functions for formatting and validating report data
 */

import {
  format,
  isAfter,
  isBefore,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import type { ReportParams } from "./types";

/**
 * Format currency in Philippine Peso
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  const startStr = format(start, "MMM d, yyyy");
  const endStr = format(end, "MMM d, yyyy");

  if (startStr === endStr) {
    return startStr;
  }

  return `${startStr} - ${endStr}`;
}

/**
 * Get month name from number (1-12)
 */
export function getMonthName(month: number): string {
  const date = new Date(2000, month - 1, 1);
  return format(date, "MMMM");
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Format percentage with % sign
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format percentage change with + or - sign
 */
export function formatPercentageChange(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Validate date range
 */
export function isValidDateRange(start: Date, end: Date): boolean {
  return isBefore(start, end) || start.getTime() === end.getTime();
}

/**
 * Generate report title based on type and filters
 */
export function generateReportTitle(params: ReportParams): string {
  switch (params.reportType) {
    case "monthly":
      return `${getMonthName(params.month!)} ${params.year} Report`;

    case "yearly":
      return `${params.year} Annual Report`;

    case "dateRange":
      return `Custom Report: ${formatDateRange(params.startDate!, params.endDate!)}`;

    case "status":
      const statuses = params.statuses?.join(", ") || "All Statuses";
      return `Booking Status Report: ${statuses}`;

    case "selected":
      const count = params.bookingIds?.length || 0;
      return `Selected Bookings Report (${count} booking${count !== 1 ? "s" : ""})`;

    case "venue":
      return "Venue Performance Report";

    case "eventType":
      return "Event Type Analysis Report";

    case "client":
      return "Client Report";

    default:
      return "Report";
  }
}

/**
 * Get date range description for metadata
 */
export function getDateRangeDescription(params: ReportParams): string {
  switch (params.reportType) {
    case "monthly":
      return `${getMonthName(params.month!)} ${params.year}`;

    case "yearly":
      return `Year ${params.year}`;

    case "dateRange":
    case "status":
    case "venue":
    case "eventType":
    case "client":
      if (params.startDate && params.endDate) {
        return formatDateRange(params.startDate, params.endDate);
      }
      return "All Time";

    case "selected":
      return "Selected Bookings";

    default:
      return "Custom Range";
  }
}

/**
 * Get date range for query based on report parameters
 */
export function getDateRangeForQuery(params: ReportParams): { start: Date; end: Date } | null {
  switch (params.reportType) {
    case "monthly":
      const monthDate = new Date(params.year!, params.month! - 1, 1);
      return {
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate),
      };

    case "yearly":
      const yearDate = new Date(params.year!, 0, 1);
      return {
        start: startOfYear(yearDate),
        end: endOfYear(yearDate),
      };

    case "dateRange":
      if (params.startDate && params.endDate) {
        return {
          start: params.startDate,
          end: params.endDate,
        };
      }
      return null;

    case "status":
    case "venue":
    case "eventType":
    case "client":
      if (params.startDate && params.endDate) {
        return {
          start: params.startDate,
          end: params.endDate,
        };
      }
      return null;

    case "selected":
      return null;

    default:
      return null;
  }
}

/**
 * Validate report parameters
 */
export function validateReportParams(params: ReportParams): { valid: boolean; error?: string } {
  // Check report type
  if (!params.reportType) {
    return { valid: false, error: "Report type is required" };
  }

  // Validate based on report type
  switch (params.reportType) {
    case "monthly":
      if (!params.year || !params.month) {
        return { valid: false, error: "Year and month are required for monthly reports" };
      }
      if (params.month < 1 || params.month > 12) {
        return { valid: false, error: "Month must be between 1 and 12" };
      }
      break;

    case "yearly":
      if (!params.year) {
        return { valid: false, error: "Year is required for yearly reports" };
      }
      break;

    case "dateRange":
      if (!params.startDate || !params.endDate) {
        return {
          valid: false,
          error: "Start date and end date are required for date range reports",
        };
      }
      if (!isValidDateRange(params.startDate, params.endDate)) {
        return { valid: false, error: "End date must be after or equal to start date" };
      }
      break;

    case "status":
      if (!params.statuses || params.statuses.length === 0) {
        return { valid: false, error: "At least one status must be selected" };
      }
      break;

    case "selected":
      if (!params.bookingIds || params.bookingIds.length === 0) {
        return { valid: false, error: "At least one booking must be selected" };
      }
      break;

    case "venue":
      if (!params.venueIds || params.venueIds.length === 0) {
        return { valid: false, error: "At least one venue must be selected" };
      }
      if (!params.startDate || !params.endDate) {
        return { valid: false, error: "Date range is required for venue reports" };
      }
      if (!isValidDateRange(params.startDate, params.endDate)) {
        return { valid: false, error: "End date must be after or equal to start date" };
      }
      break;

    case "eventType":
      if (!params.eventTypeIds || params.eventTypeIds.length === 0) {
        return { valid: false, error: "At least one event type must be selected" };
      }
      if (!params.startDate || !params.endDate) {
        return { valid: false, error: "Date range is required for event type reports" };
      }
      if (!isValidDateRange(params.startDate, params.endDate)) {
        return { valid: false, error: "End date must be after or equal to start date" };
      }
      break;

    case "client":
      if (!params.clientIds || params.clientIds.length === 0) {
        return { valid: false, error: "At least one client must be selected" };
      }
      if (
        params.startDate &&
        params.endDate &&
        !isValidDateRange(params.startDate, params.endDate)
      ) {
        return { valid: false, error: "End date must be after or equal to start date" };
      }
      break;
  }

  return { valid: true };
}

/**
 * Calculate safe division to avoid division by zero
 */
export function safeDivide(
  numerator: number,
  denominator: number,
  defaultValue: number = 0
): number {
  if (denominator === 0) return defaultValue;
  return numerator / denominator;
}

/**
 * Round to 2 decimal places
 */
export function roundToTwo(num: number): number {
  return Math.round(num * 100) / 100;
}
