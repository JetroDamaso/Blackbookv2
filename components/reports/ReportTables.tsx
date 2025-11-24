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
import { formatCurrency } from "@/lib/reports/utils";
import type { BookingBreakdown, FinancialBreakdown, ClientStats } from "@/lib/reports/types";

interface ReportTablesProps {
  bookingBreakdown: BookingBreakdown;
  financialBreakdown: FinancialBreakdown;
  clientStats: ClientStats;
  showMonthlyBreakdown?: boolean;
}

export function ReportTables({
  bookingBreakdown,
  financialBreakdown,
  clientStats,
  showMonthlyBreakdown = false,
}: ReportTablesProps) {
  return (
    <div className="space-y-6 print:space-y-4">
      {/* Booking Breakdown Section */}
      <div className="grid gap-4 md:grid-cols-3 print:gap-2">
        <Card className="print:shadow-none print:border">
          <CardHeader className="print:bg-white border-b">
            <CardTitle className="text-base font-bold text-gray-900">Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableBody>
                {Object.entries(bookingBreakdown.byStatus).map(([status, count]) => (
                  <TableRow key={status}>
                    <TableCell className="font-semibold text-gray-700">{status}</TableCell>
                    <TableCell className="text-right font-bold text-gray-900">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border">
          <CardHeader className="print:bg-white border-b">
            <CardTitle className="text-base font-bold text-gray-900">Bookings by Venue</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableBody>
                {Object.entries(bookingBreakdown.byVenue).map(([venue, count]) => (
                  <TableRow key={venue}>
                    <TableCell className="font-semibold text-gray-700">{venue}</TableCell>
                    <TableCell className="text-right font-bold text-gray-900">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="print:shadow-none print:border">
          <CardHeader className="print:bg-white border-b">
            <CardTitle className="text-base font-bold text-gray-900">Bookings by Event Type</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Table>
              <TableBody>
                {Object.entries(bookingBreakdown.byEventType).map(([type, count]) => (
                  <TableRow key={type}>
                    <TableCell className="font-semibold text-gray-700">{type}</TableCell>
                    <TableCell className="text-right font-bold text-gray-900">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="print:shadow-none print:border">
        <CardHeader className="print:bg-white border-b">
          <CardTitle className="text-lg font-bold text-gray-900">Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-300">
                <span className="text-sm font-semibold text-gray-700">Total Bookings Value:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(financialBreakdown.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-300">
                <span className="text-sm font-semibold text-gray-700">Payments Collected:</span>
                <span className="text-lg font-bold text-green-700">
                  {formatCurrency(financialBreakdown.paymentsCollected)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-300">
                <span className="text-sm font-semibold text-gray-700">Outstanding Balance:</span>
                <span className="text-lg font-bold text-orange-700">
                  {formatCurrency(financialBreakdown.outstandingBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-300">
                <span className="text-sm font-semibold text-gray-700">Overdue Payments:</span>
                <span className="text-lg font-bold text-red-700">
                  {financialBreakdown.overduePayments}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-base font-bold text-gray-900 mb-3">Discounts Given</h4>
              <div className="flex justify-between items-center p-3 rounded-lg border border-gray-300">
                <span className="text-sm font-semibold text-gray-700">Total:</span>
                <span className="text-lg font-bold text-blue-700">
                  {formatCurrency(financialBreakdown.discountsGiven.total)}
                </span>
              </div>
              {Object.entries(financialBreakdown.discountsGiven.byType).map(([type, amount]) => (
                <div key={type} className="flex justify-between items-center p-2 rounded border border-gray-300">
                  <span className="text-sm font-medium text-gray-600">{type}:</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-base font-bold text-gray-900 mb-4">Revenue by Venue</h4>
            <Table>
              <TableHeader>
                <TableRow className="border-b">
                  <TableHead className="font-bold text-gray-900">Venue</TableHead>
                  <TableHead className="text-right font-bold text-gray-900">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(financialBreakdown.revenueByVenue)
                  .sort(([, a], [, b]) => b - a)
                  .map(([venue, revenue], index) => (
                    <TableRow key={venue} className="border-b">
                      <TableCell className="font-semibold text-gray-700">{venue}</TableCell>
                      <TableCell className="text-right font-bold text-gray-900">{formatCurrency(revenue)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {showMonthlyBreakdown && financialBreakdown.revenueByMonth && (
            <div className="border-t pt-6">
              <h4 className="text-base font-bold text-gray-900 mb-4">Monthly Revenue Breakdown</h4>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="font-bold text-gray-900">Month</TableHead>
                    <TableHead className="text-right font-bold text-gray-900">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(financialBreakdown.revenueByMonth).map(([month, revenue], index) => (
                    <TableRow key={month} className="border-b">
                      <TableCell className="font-semibold text-gray-700">{month}</TableCell>
                      <TableCell className="text-right font-bold text-gray-900">{formatCurrency(revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Statistics */}
      <Card className="print:shadow-none print:border">
        <CardHeader className="print:bg-white border-b">
          <CardTitle className="text-lg font-bold text-gray-900">Client Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-1">
            <div className="p-4 rounded-lg border border-gray-300">
              <p className="text-sm font-semibold text-gray-600 mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-gray-900">{clientStats.totalClients}</p>
            </div>
          </div>

          {clientStats.topClients.length > 0 && (
            <div className="border-t pt-6">
              <h4 className="text-base font-bold text-gray-900 mb-4">Top Clients</h4>
              <Table>
                <TableHeader>
                  <TableRow className="border-b">
                    <TableHead className="font-bold text-gray-900">Client</TableHead>
                    <TableHead className="text-right font-bold text-gray-900">Bookings</TableHead>
                    <TableHead className="text-right font-bold text-gray-900">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientStats.topClients.map((client, index) => (
                    <TableRow key={client.id} className="border-b">
                      <TableCell className="font-semibold text-gray-700">{client.name}</TableCell>
                      <TableCell className="text-right font-bold text-gray-900">{client.bookingCount}</TableCell>
                      <TableCell className="text-right font-bold text-gray-900">
                        {formatCurrency(client.totalSpent)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
