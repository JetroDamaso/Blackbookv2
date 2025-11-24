"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/reports/utils";

interface ReportSummaryCardsProps {
  summary: {
    totalBookings: number;
    totalRevenue: number;
    averageBookingValue: number;
    cancellationRate: number;
  };
}

export function ReportSummaryCards({ summary }: ReportSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 print:gap-2">
      <Card className="print:shadow-none print:border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Total Bookings</CardTitle>
          <Users className="h-5 w-5 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{summary.totalBookings}</div>
          <p className="text-xs text-gray-500 mt-1">Event bookings</p>
        </CardContent>
      </Card>

      <Card className="print:shadow-none print:border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Total Bookings Value</CardTitle>
          <DollarSign className="h-5 w-5 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(summary.totalRevenue)}</div>
          <p className="text-xs text-gray-500 mt-1">Confirmed, Completed & Unpaid</p>
        </CardContent>
      </Card>

      <Card className="print:shadow-none print:border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Average Value</CardTitle>
          <TrendingUp className="h-5 w-5 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{formatCurrency(summary.averageBookingValue)}</div>
          <p className="text-xs text-gray-500 mt-1">Per booking</p>
        </CardContent>
      </Card>

      <Card className="print:shadow-none print:border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold text-gray-700">Cancellation Rate</CardTitle>
          <AlertCircle className="h-5 w-5 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{summary.cancellationRate.toFixed(1)}%</div>
          <p className="text-xs text-gray-500 mt-1">Of total bookings</p>
        </CardContent>
      </Card>
    </div>
  );
}
