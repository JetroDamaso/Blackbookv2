"use client";

import { useState } from "react";
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
import PrintReport from "../(Print)/PrintReport";

interface ReportDisplayProps {
  report: Report | null;
  isLoading: boolean;
}

export function ReportDisplay({ report, isLoading }: ReportDisplayProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);

    // Create a print-specific style
    const printStyle = document.createElement("style");
    printStyle.id = "report-print-style";
    printStyle.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        .report-print-area, .report-print-area * {
          visibility: visible;
        }
        .report-print-area {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(printStyle);

    setTimeout(() => {
      window.print();
      // Cleanup
      const styleEl = document.getElementById("report-print-style");
      if (styleEl) {
        styleEl.remove();
      }
      setIsPrinting(false);
    }, 100);
  };

  const handleExportPDF = () => {
    handlePrint();
  };

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
    <div className="space-y-6">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              margin: 0.5in;
              size: A4;
            }

            body {
              margin: 0;
              padding: 0;
              background: white !important;
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-section {
              page-break-inside: avoid;
            }

            .print-section-large {
              page-break-inside: auto;
            }

            table {
              page-break-inside: auto;
              width: 100%;
            }

            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }

            thead {
              display: table-header-group;
            }

            .print-hide {
              display: none !important;
            }
          }
        `,
        }}
      />

        {/* Professional Report Header */}
        <Card className="print-section print:shadow-none print:border-2 print:border-black">
          <CardHeader className="space-y-4 print:bg-white print:space-y-2 print:pb-3">
            {/* Company Header */}
            <div className="flex items-start justify-between border-b pb-4 print:border-b-2 print:border-black print:pb-2">
              <div className="space-y-1 print:space-y-0">
                <h1 className="text-3xl font-bold text-gray-900 print:text-base print:text-black">
                 Susings & Rufins Farm
                </h1>
                <p className="text-sm text-gray-600 print:text-[10px] print:text-black">Events place and accommodation.</p>
                <p className="text-xs text-gray-500 print:text-[9px] print:text-black">
                  Generated on {format(new Date(report.metadata.generatedAt), "MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
              <div className="text-right print-hide">
                <ExportButtons report={report} onPrint={handlePrint} />
              </div>
            </div>

            {/* Report Title and Period */}
            <div className="space-y-2 print:space-y-1">
              <CardTitle className="text-2xl font-bold text-gray-900 print:text-sm print:text-black">
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
              <p className="text-base text-gray-700 font-medium print:text-xs print:text-black">
                {report.metadata.dateRange.description}
              </p>
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

      {/* Detailed Bookings List */}
      <Card className="print-section-large print:shadow-none print:border">
        <CardHeader className="print:bg-white border-b print:border-black">
          <CardTitle className="text-lg font-bold text-gray-900 print:text-sm print:text-black">
            Detailed Booking Records
          </CardTitle>
          <p className="text-sm text-gray-600 print:text-xs print:text-black">
            {report.bookings.length} {report.bookings.length === 1 ? 'booking' : 'bookings'} in this period
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="print:text-xs">
              <TableHeader>
                <TableRow className="print:bg-white print:border-b-2 print:border-black">
                  <TableHead className="font-bold text-gray-900 print:text-xs print:p-2 print:text-black">ID</TableHead>
                  <TableHead className="font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Event Date</TableHead>
                  <TableHead className="font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Event Name</TableHead>
                  <TableHead className="font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Client</TableHead>
                  <TableHead className="font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Venue</TableHead>
                  <TableHead className="font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Event Type</TableHead>
                  <TableHead className="font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Status</TableHead>
                  <TableHead className="text-right font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Total Amount</TableHead>
                  <TableHead className="text-right font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Amount Paid</TableHead>
                  <TableHead className="text-right font-bold text-gray-900 print:text-xs print:p-2 print:text-black">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.bookings.length > 0 ? (
                  report.bookings.map((booking, index) => (
                    <TableRow key={booking.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <TableCell className="font-semibold text-gray-900 print:text-xs print:p-2">{booking.id}</TableCell>
                      <TableCell className="text-gray-700 print:text-xs print:p-2">{format(new Date(booking.eventDate), "MMM d, yyyy")}</TableCell>
                      <TableCell className="text-gray-700 print:text-xs print:p-2">{booking.eventName}</TableCell>
                      <TableCell className="text-gray-700 print:text-xs print:p-2">{booking.client}</TableCell>
                      <TableCell className="text-gray-700 print:text-xs print:p-2">{booking.venue}</TableCell>
                      <TableCell className="text-gray-700 print:text-xs print:p-2">{booking.eventType}</TableCell>
                      <TableCell className="print:p-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold print:text-[10px] print:px-1.5 print:py-0",
                            booking.status === "Pending" && "bg-yellow-100 text-yellow-800 border border-yellow-200",
                            booking.status === "Confirmed" && "bg-blue-100 text-blue-800 border border-blue-200",
                            booking.status === "In Progress" && "bg-purple-100 text-purple-800 border border-purple-200",
                            booking.status === "Completed" && "bg-green-100 text-green-800 border border-green-200",
                            booking.status === "Unpaid" && "bg-red-100 text-red-800 border border-red-200",
                            booking.status === "Cancelled" && "bg-gray-100 text-gray-800 border border-gray-200",
                            booking.status === "Archived" && "bg-slate-100 text-slate-800 border border-slate-200"
                          )}
                        >
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-900 print:text-xs print:p-2">
                        {formatCurrency(booking.totalAmount)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-700 print:text-xs print:p-2">
                        {formatCurrency(booking.paidAmount)}
                      </TableCell>
                      <TableCell className="text-right print:p-2">
                        <span className={cn(
                          "font-semibold print:text-xs",
                          booking.balance > 0 ? "text-orange-600" : "text-green-700"
                        )}>
                          {formatCurrency(booking.balance)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-gray-500 py-8 print:text-xs">
                      No bookings found for the selected criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Hidden Print Component */}
      <div className={isPrinting ? "report-print-area" : "hidden"}>
        <PrintReport report={report} />
      </div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
