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
    <div className="space-y-6">
      {/* Booking Breakdown Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {Object.entries(bookingBreakdown.byStatus).map(([status, count]) => (
                  <TableRow key={status}>
                    <TableCell className="font-medium">{status}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings by Venue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {Object.entries(bookingBreakdown.byVenue).map(([venue, count]) => (
                  <TableRow key={venue}>
                    <TableCell className="font-medium">{venue}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bookings by Event Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {Object.entries(bookingBreakdown.byEventType).map(([type, count]) => (
                  <TableRow key={type}>
                    <TableCell className="font-medium">{type}</TableCell>
                    <TableCell className="text-right">{count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total Revenue:</span>
                <span className="text-sm font-bold">
                  {formatCurrency(financialBreakdown.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Payments Collected:</span>
                <span className="text-sm font-bold text-green-600">
                  {formatCurrency(financialBreakdown.paymentsCollected)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Outstanding Balance:</span>
                <span className="text-sm font-bold text-orange-600">
                  {formatCurrency(financialBreakdown.outstandingBalance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Overdue Payments:</span>
                <span className="text-sm font-bold text-red-600">
                  {financialBreakdown.overduePayments}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Discounts Given</h4>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-sm font-bold">
                  {formatCurrency(financialBreakdown.discountsGiven.total)}
                </span>
              </div>
              {Object.entries(financialBreakdown.discountsGiven.byType).map(([type, amount]) => (
                <div key={type} className="flex justify-between">
                  <span className="text-sm text-muted-foreground">{type}:</span>
                  <span className="text-sm">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-2">Revenue by Venue</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(financialBreakdown.revenueByVenue)
                  .sort(([, a], [, b]) => b - a)
                  .map(([venue, revenue]) => (
                    <TableRow key={venue}>
                      <TableCell className="font-medium">{venue}</TableCell>
                      <TableCell className="text-right">{formatCurrency(revenue)}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {showMonthlyBreakdown && financialBreakdown.revenueByMonth && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Monthly Revenue Breakdown</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(financialBreakdown.revenueByMonth).map(([month, revenue]) => (
                    <TableRow key={month}>
                      <TableCell className="font-medium">{month}</TableCell>
                      <TableCell className="text-right">{formatCurrency(revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Client Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Client Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <p className="text-2xl font-bold">{clientStats.totalClients}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">New Clients</p>
              <p className="text-2xl font-bold text-green-600">{clientStats.newClients}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Returning Clients</p>
              <p className="text-2xl font-bold text-blue-600">{clientStats.returningClients}</p>
            </div>
          </div>

          {clientStats.topClients.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">Top Clients</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead className="text-right">Bookings</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientStats.topClients.map(client => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell className="text-right">{client.bookingCount}</TableCell>
                      <TableCell className="text-right">
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
