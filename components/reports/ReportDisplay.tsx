"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency, generateReportTitle } from "@/lib/reports/utils";
import type { Report, ReportType } from "@/lib/reports/types";
import { ReportSummaryCards } from "./ReportSummaryCards";
import { ReportTables } from "./ReportTables";
import { ExportButtons } from "./ExportButtons";

interface ReportDisplayProps {
  report: Report | null;
  isLoading: boolean;
}

export function ReportDisplay({ report, isLoading }: ReportDisplayProps) {
  // Empty state
  if (!report && !isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Report Generated</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Configure your report settings above and click &quot;Generate Report&quot; to view
            results.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Report display
  if (!report) return null;

  const isYearlyReport = report.metadata.reportType === "yearly";

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Report Header - Print Friendly */}
      <Card className="print:shadow-none print:border-0">
        <CardHeader className="space-y-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">
                {generateReportTitle({
                  reportType: report.metadata.reportType as ReportType,
                  year: report.metadata.filters.clients
                    ? undefined
                    : new Date(report.metadata.dateRange.start).getFullYear(),
                  month:
                    report.metadata.reportType === "monthly"
                      ? new Date(report.metadata.dateRange.start).getMonth() + 1
                      : undefined,
                  startDate: report.metadata.dateRange.start,
                  endDate: report.metadata.dateRange.end,
                  statuses: report.metadata.filters.statuses,
                  bookingIds: report.metadata.filters.bookingIds,
                })}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {report.metadata.dateRange.description}
              </p>
            </div>
            <div className="print:hidden">
              <ExportButtons report={report} />
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Generated on {format(new Date(report.metadata.generatedAt), "PPpp")}
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <ReportSummaryCards summary={report.summary} />

      {/* Breakdown Tables and Financial Info */}
      <ReportTables
        bookingBreakdown={report.bookingBreakdown}
        financialBreakdown={report.financialBreakdown}
        clientStats={report.clientStats}
        showMonthlyBreakdown={isYearlyReport}
      />

      {/* Inventory Stats (if available) */}
      {report.inventoryStats && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Checkouts</p>
                <p className="text-2xl font-bold">{report.inventoryStats.totalCheckouts}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Damaged Items</p>
                <p className="text-2xl font-bold text-orange-600">
                  {report.inventoryStats.damagedItems}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Missing Items</p>
                <p className="text-2xl font-bold text-red-600">
                  {report.inventoryStats.missingItems}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Bookings ({report.bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Event Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Event Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.bookings.length > 0 ? (
                  report.bookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>{format(new Date(booking.eventDate), "MMM d, yyyy")}</TableCell>
                      <TableCell>{booking.client}</TableCell>
                      <TableCell>{booking.venue}</TableCell>
                      <TableCell>{booking.eventType}</TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                            booking.status === "Completed" && "bg-green-100 text-green-700",
                            booking.status === "Confirmed" && "bg-blue-100 text-blue-700",
                            booking.status === "Pending" && "bg-yellow-100 text-yellow-700",
                            booking.status === "Cancelled" && "bg-red-100 text-red-700"
                          )}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(booking.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        {formatCurrency(booking.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={booking.balance > 0 ? "text-orange-600 font-medium" : ""}>
                          {formatCurrency(booking.balance)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No bookings found for the selected criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
