import React from "react";
import Image from "next/image";
import { format } from "date-fns";
import type { Report } from "@/lib/reports/types";

interface PrintReportProps {
  report: Report;
}

const PrintReport = ({ report }: PrintReportProps) => {
  // Format currency helper
  const formatCurrency = (amount: number) => {
    return `₱${
      amount?.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "0.00"
    }`;
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "In Progress":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "Completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "Unpaid":
        return "bg-red-100 text-red-800 border-red-300";
      case "Cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "Archived":
        return "bg-slate-100 text-slate-800 border-slate-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="w-full bg-white text-black font-sans">
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
            }

            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-container {
              width: 100%;
              max-width: none;
              margin: 0;
              padding: 0;
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

            .no-print {
              display: none;
            }
          }

          @media screen {
            .print-container {
              max-width: 210mm;
              margin: 0 auto;
              padding: 0.5in;
              min-height: 297mm;
            }
          }
        `,
        }}
      />

      <div className="print-container bg-white">
        {/* Header */}
        <div className="text-center mb-4 print-section border-b-2 border-black pb-3">
          <div className="flex gap-3 w-full items-center justify-center mb-2">
            <Image src={"/susings_and_rufins_logo.png"} alt="Logo" height={32} width={45} />
            <h1 className="font-bold text-xl text-black">Susing & Rufins Farm</h1>
          </div>
          <p className="text-xs text-black">Professional Event & Catering Services</p>
          <p className="text-xs text-black mt-1">
            Generated: {format(new Date(report.metadata.generatedAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>

        {/* Report Title */}
        <div className="mb-4 print-section">
          <h2 className="text-base font-bold text-black mb-1">
            {report.metadata.reportType === "monthly" && `Monthly Report`}
            {report.metadata.reportType === "yearly" && `Yearly Report`}
            {report.metadata.reportType === "dateRange" && `Date Range Report`}
          </h2>
          <p className="text-xs text-black">
            {report.metadata.dateRange.description}
          </p>
        </div>

        {/* Summary Statistics - Grid Layout */}
        <div className="mb-4 print-section">
          <h3 className="text-sm font-bold text-black mb-2 border-b border-black pb-1">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-4 gap-2">
            <div className="border border-gray-300 p-2 rounded">
              <p className="text-[9px] text-gray-600 uppercase">Total Bookings</p>
              <p className="text-lg font-bold text-gray-900">{report.summary.totalBookings}</p>
            </div>
            <div className="border border-gray-300 p-2 rounded">
              <p className="text-[9px] text-gray-600 uppercase">Total Revenue</p>
              <p className="text-lg font-bold text-green-700">{formatCurrency(report.summary.totalRevenue)}</p>
            </div>
            <div className="border border-gray-300 p-2 rounded">
              <p className="text-[9px] text-gray-600 uppercase">Avg Booking Value</p>
              <p className="text-lg font-bold text-blue-700">{formatCurrency(report.summary.averageBookingValue)}</p>
            </div>
            <div className="border border-gray-300 p-2 rounded">
              <p className="text-[9px] text-gray-600 uppercase">Cancellation Rate</p>
              <p className="text-lg font-bold text-orange-600">{report.summary.cancellationRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Booking Status Breakdown */}
        {report.bookingBreakdown && report.bookingBreakdown.byStatus && (
          <div className="mb-4 print-section">
            <h3 className="text-sm font-bold text-black mb-2 border-b border-black pb-1">
              Booking Status Breakdown
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(report.bookingBreakdown.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center border-b border-gray-200 py-1">
                  <span className="text-xs text-gray-700">{status}</span>
                  <span className="text-xs font-semibold text-gray-900">{count} bookings</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Venue Breakdown */}
        {report.bookingBreakdown && report.bookingBreakdown.byVenue && Object.keys(report.bookingBreakdown.byVenue).length > 0 && (
          <div className="mb-4 print-section">
            <h3 className="text-sm font-bold text-black mb-2 border-b border-black pb-1">
              Bookings by Venue
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(report.bookingBreakdown.byVenue).map(([venue, count]) => (
                <div key={venue} className="flex justify-between items-center border-b border-gray-200 py-1">
                  <span className="text-xs text-gray-700">{venue}</span>
                  <span className="text-xs font-semibold text-gray-900">{count} bookings</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Financial Breakdown */}
        {report.financialBreakdown && (
          <div className="mb-4 print-section">
            <h3 className="text-sm font-bold text-black mb-2 border-b border-black pb-1">
              Financial Summary
            </h3>
            <div className="space-y-1">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-xs text-gray-700">Total Revenue</span>
                <span className="text-xs font-semibold text-gray-900">{formatCurrency(report.financialBreakdown.totalRevenue)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-xs text-gray-700">Payments Collected</span>
                <span className="text-xs font-semibold text-green-700">{formatCurrency(report.financialBreakdown.paymentsCollected)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-xs text-gray-700">Outstanding Balance</span>
                <span className="text-xs font-semibold text-orange-600">{formatCurrency(report.financialBreakdown.outstandingBalance)}</span>
              </div>
              {report.financialBreakdown.overduePayments > 0 && (
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-xs text-gray-700">Overdue Payments</span>
                  <span className="text-xs font-semibold text-red-600">{formatCurrency(report.financialBreakdown.overduePayments)}</span>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Top Clients */}
        {report.clientStats && report.clientStats.topClients && report.clientStats.topClients.length > 0 && (
          <div className="mb-4 print-section">
            <h3 className="text-sm font-bold text-black mb-2 border-b border-black pb-1">
              Top Clients by Revenue
            </h3>
            <div className="space-y-1">
              {report.clientStats.topClients.slice(0, 5).map((client, index) => (
                <div key={client.id} className="flex justify-between items-center border-b border-gray-200 py-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-500">#{index + 1}</span>
                    <span className="text-xs text-gray-700">{client.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-gray-900">{formatCurrency(client.totalSpent)}</span>
                    <span className="text-[10px] text-gray-500 ml-2">({client.bookingCount} bookings)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Bookings Table */}
        <div className="print-section-large">
          <h3 className="text-sm font-bold text-black mb-2 border-b border-black pb-1">
            Detailed Booking Records ({report.bookings.length} bookings)
          </h3>

          {report.bookings.length > 0 ? (
            <table className="w-full border-collapse text-[9px]">
              <thead>
                <tr className="bg-white border-b-2 border-black">
                  <th className="text-left p-1 font-bold">ID</th>
                  <th className="text-left p-1 font-bold">Date</th>
                  <th className="text-left p-1 font-bold">Event Name</th>
                  <th className="text-left p-1 font-bold">Client</th>
                  <th className="text-left p-1 font-bold">Venue</th>
                  <th className="text-left p-1 font-bold">Event Type</th>
                  <th className="text-center p-1 font-bold">Status</th>
                  <th className="text-right p-1 font-bold">Total</th>
                  <th className="text-right p-1 font-bold">Paid</th>
                  <th className="text-right p-1 font-bold">Balance</th>
                </tr>
              </thead>
              <tbody>
                {report.bookings.map((booking, index) => (
                  <tr key={booking.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-1 font-semibold text-gray-900 border-b border-gray-200">{booking.id}</td>
                    <td className="p-1 text-gray-700 border-b border-gray-200">
                      {format(new Date(booking.eventDate), "MMM d, yyyy")}
                    </td>
                    <td className="p-1 text-gray-700 border-b border-gray-200">{booking.eventName}</td>
                    <td className="p-1 text-gray-700 border-b border-gray-200">{booking.client}</td>
                    <td className="p-1 text-gray-700 border-b border-gray-200">{booking.venue}</td>
                    <td className="p-1 text-gray-700 border-b border-gray-200">{booking.eventType}</td>
                    <td className="p-1 text-center border-b border-gray-200">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-semibold border ${getStatusColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="p-1 text-right font-semibold text-gray-900 border-b border-gray-200">
                      {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="p-1 text-right font-semibold text-green-700 border-b border-gray-200">
                      {formatCurrency(booking.paidAmount)}
                    </td>
                    <td className="p-1 text-right font-semibold border-b border-gray-200">
                      <span className={booking.balance > 0 ? "text-orange-600" : "text-green-700"}>
                        {formatCurrency(booking.balance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-white border-t-2 border-black font-bold">
                  <td colSpan={6} className="p-1 text-right">TOTALS:</td>
                  <td className="p-1 text-right text-gray-900">
                    {formatCurrency(report.bookings.reduce((sum, b) => sum + b.totalAmount, 0))}
                  </td>
                  <td className="p-1 text-right text-green-700">
                    {formatCurrency(report.bookings.reduce((sum, b) => sum + b.paidAmount, 0))}
                  </td>
                  <td className="p-1 text-right text-orange-600">
                    {formatCurrency(report.bookings.reduce((sum, b) => sum + b.balance, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <div className="text-center py-8 text-xs text-gray-500 border border-gray-300 rounded">
              No bookings found for the selected criteria
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-gray-300 text-center print-section">
          <p className="text-[9px] text-gray-500">
            This is a computer-generated report from Susings & Rufins Event Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrintReport;
