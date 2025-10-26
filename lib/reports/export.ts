/**
 * Report Export Functions
 * Functions for exporting reports in different formats
 */

import type { Report } from "./types";
import { formatCurrency, formatDateRange } from "./utils";
import { format } from "date-fns";

/**
 * Prepare report for printing
 * Opens browser print dialog with print-optimized layout
 */
export function printReport() {
  window.print();
}

/**
 * Export report to CSV
 * Downloads a CSV file with booking details
 */
export function exportToCSV(report: Report, filename: string = "report.csv") {
  const headers = [
    "Booking ID",
    "Event Date",
    "Status",
    "Venue",
    "Event Type",
    "Client",
    "Total Amount",
    "Paid Amount",
    "Balance",
  ];

  const rows = report.bookings.map(booking => [
    booking.id,
    format(new Date(booking.eventDate), "yyyy-MM-dd"),
    booking.status,
    booking.venue,
    booking.eventType,
    booking.client,
    booking.totalAmount.toString(),
    booking.paidAmount.toString(),
    booking.balance.toString(),
  ]);

  const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");

  downloadFile(csvContent, filename, "text/csv");
}

/**
 * Export report to Excel (CSV format compatible with Excel)
 */
export function exportToExcel(report: Report, filename: string = "report.csv") {
  // Create multiple sheets in CSV format
  let content = "=== SUMMARY ===\n";
  content += `Total Bookings,${report.summary.totalBookings}\n`;
  content += `Total Revenue,${formatCurrency(report.summary.totalRevenue)}\n`;
  content += `Average Booking Value,${formatCurrency(report.summary.averageBookingValue)}\n`;
  content += `Cancellation Rate,${report.summary.cancellationRate}%\n\n`;

  content += "=== BOOKINGS BY STATUS ===\n";
  Object.entries(report.bookingBreakdown.byStatus).forEach(([status, count]) => {
    content += `${status},${count}\n`;
  });
  content += "\n";

  content += "=== BOOKINGS BY VENUE ===\n";
  Object.entries(report.bookingBreakdown.byVenue).forEach(([venue, count]) => {
    content += `${venue},${count}\n`;
  });
  content += "\n";

  content += "=== FINANCIAL BREAKDOWN ===\n";
  content += `Total Revenue,${formatCurrency(report.financialBreakdown.totalRevenue)}\n`;
  content += `Payments Collected,${formatCurrency(report.financialBreakdown.paymentsCollected)}\n`;
  content += `Outstanding Balance,${formatCurrency(report.financialBreakdown.outstandingBalance)}\n`;
  content += `Overdue Payments,${report.financialBreakdown.overduePayments}\n\n`;

  content += "=== DETAILED BOOKINGS ===\n";
  content +=
    "Booking ID,Event Date,Status,Venue,Event Type,Client,Total Amount,Paid Amount,Balance\n";

  report.bookings.forEach(booking => {
    content +=
      [
        booking.id,
        format(new Date(booking.eventDate), "yyyy-MM-dd"),
        booking.status,
        booking.venue,
        booking.eventType,
        booking.client,
        booking.totalAmount,
        booking.paidAmount,
        booking.balance,
      ].join(",") + "\n";
  });

  downloadFile(content, filename, "text/csv");
}

/**
 * Generate PDF export
 * Note: This creates a print-ready version and triggers browser print
 * For server-side PDF generation, you'd need a library like puppeteer or pdfmake
 */
export function exportToPDF() {
  // Open print dialog with print-optimized CSS
  window.print();
}

/**
 * Download file helper
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Format report for JSON export
 */
export function exportToJSON(report: Report, filename: string = "report.json") {
  const content = JSON.stringify(report, null, 2);
  downloadFile(content, filename, "application/json");
}
