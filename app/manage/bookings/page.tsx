"use client";
import BookingDialogComponent from "@/components/(Calendar)/BookingDialog";
import { ChartPieSimple } from "@/components/Charts/EventDistribution";
import { ChartBarDefault } from "@/components/Charts/TotalBookingsChart";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAllBookingsPaginated, getBookingStatistics } from "@/server/Booking/pullActions";
import { useQuery } from "@tanstack/react-query";
import { Book, Dot, HandCoins, Notebook } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function ManageBookings() {
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { data: session } = useSession();

  const { isPending, error, data } = useQuery({
    queryKey: ["allBookings", currentPage],
    queryFn: () => getAllBookingsPaginated(currentPage, pageSize),
  });

  // Fetch booking statistics
  const { data: stats } = useQuery({
    queryKey: ["bookingStatistics"],
    queryFn: () => getBookingStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRowClick = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsDialogOpen(true);
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(3)}M`.replace(/\.?0+M$/, "M");
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}k`.replace(/\.0k$/, "k");
    }
    return amount.toFixed(0);
  };

  // Render widgets based on user role
  const renderWidgets = () => {
    const userRole = session?.user?.role;

    // Owner widgets
    if (userRole === "Owner") {
      // Get event type data for top 3 event types
      const eventTypes = stats?.eventTypeStats || {};
      const sortedEventTypes = Object.entries(eventTypes).sort((a, b) => b[1].count - a[1].count);
      const [eventType1, eventType2, eventType3] = sortedEventTypes.slice(0, 3);

      // Prepare data for pie chart
      const pieChartData = sortedEventTypes.map(([name, data]) => ({
        eventType: name,
        count: data.count,
      }));

      return (
        <>
          {/* Total Bookings */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Bookings</p>
              <p className="text-4xl font-semibold">{stats?.totalBookings || 0}</p>
              <p className="text-xs">
                Average{" "}
                <span className="text-primary">{stats?.averageBookingsPerMonth || 0}/month</span>
              </p>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Active Bookings</p>
              <p className="text-4xl font-semibold">{stats?.activeBookings || 0}</p>
              <p className="text-xs">
                <span className="text-primary">Pending, Confirmed & In Progress</span>
              </p>
            </div>
          </div>

          {/* Yearly Revenue */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Yearly Revenue</p>
              <p className="text-4xl font-semibold flex">
                ₱ {formatCurrency(stats?.yearlyRevenue || 0)}
              </p>
              <p className="text-xs">
                Average{" "}
                <span className="text-primary">
                  ₱{formatCurrency(stats?.monthlyRevenueAverage || 0)}/month
                </span>
              </p>
            </div>
          </div>

          {/* Event Type Distribution */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-6 min-w-[400px] flex-shrink-0">
            {eventType1 && (
              <>
                <div className="flex flex-col">
                  <p className="text-md">{eventType1[0]}</p>
                  <p className="text-4xl font-semibold flex items-center">
                    {eventType1[1].count} <Dot className="text-orange-500 size-12 -ml-3" />
                  </p>
                  <p className="text-xs">{eventType1[1].percentage}% of total bookings</p>
                </div>
                {eventType2 && (
                  <>
                    <div className="h-16 border-1"></div>
                    <div className="flex flex-col">
                      <p className="text-md">{eventType2[0]}</p>
                      <p className="text-4xl font-semibold flex items-center">
                        {eventType2[1].count} <Dot className="text-teal-500 size-12 -ml-3" />
                      </p>
                      <p className="text-xs">{eventType2[1].percentage}% of total bookings</p>
                    </div>
                  </>
                )}
                {eventType3 && (
                  <>
                    <div className="h-16 border-1"></div>
                    <div className="flex flex-col">
                      <p className="text-md">{eventType3[0]}</p>
                      <p className="text-4xl font-semibold flex items-center">
                        {eventType3[1].count} <Dot className="text-cyan-500 size-12 -ml-3" />
                      </p>
                      <p className="text-xs">{eventType3[1].percentage}% of total bookings</p>
                    </div>
                  </>
                )}
                <div className="flex flex-col">
                  <div className="w-24 h-fit">
                    <ChartPieSimple data={pieChartData} />
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      );
    }

    // Manager and Front Desk widgets - Show only Active Bookings
    return (
      <>
        {/* Active Bookings */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Active Bookings</p>
            <p className="text-4xl font-semibold">{stats?.activeBookings || 0}</p>
            <p className="text-xs">
              <span className="text-primary">Pending, Confirmed & In Progress</span>
            </p>
          </div>
        </div>
      </>
    );
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">Error loading bookings: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Book size={18} /> <span>Bookings</span>
          </p>
        </div>
      </header>
      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        {renderWidgets()}

        {/* Action Widgets - Show for all roles */}
        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => (window.location.href = "/reports")}
        >
          <Notebook className="size-9 text-blue-600" />
          <p className="text-sm select-none">All Reports</p>
        </div>

        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => console.log("Navigate to payment view")}
        >
          <HandCoins className="size-9 text-green-600" />
          <p className="text-sm select-none">Payment View</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.data || []}
          onRowClick={handleRowClick}
          pagination={data?.pagination}
          onPageChange={setCurrentPage}
        />
        {selectedBookingId && (
          <BookingDialogComponent
            bookingId={selectedBookingId}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}
      </div>
    </>
  );
}
