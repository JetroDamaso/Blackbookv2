"use client";
import BookingDialogComponent from "@/components/(Calendar)/BookingDialog";
import { ChartPieSimple } from "@/components/Charts/EventDistribution";
import { ChartBarDefault } from "@/components/Charts/TotalBookingsChart";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAllBookingsPaginated } from "@/server/Booking/pullActions";
import { useQuery } from "@tanstack/react-query";
import { Book, Dot, HandCoins, Notebook } from "lucide-react";
import { useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function ManageBookings() {
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { isPending, error, data } = useQuery({
    queryKey: ["allBookings", currentPage],
    queryFn: () => getAllBookingsPaginated(currentPage, pageSize),
  });

  const handleRowClick = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setIsDialogOpen(true);
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

          <Button variant={"outline"}>Edit Widgets</Button>
        </div>
      </header>
      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Bookings</p>
            <p className="text-4xl font-semibold">{data?.pagination.totalCount || 0}</p>
            <p className="text-xs">
              Average <span className="text-primary">20/month</span>
            </p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Yearly Revenue</p>
            <p className="text-4xl font-semibold flex">₱ 530k</p>
            <p className="text-xs">
              Average <span className="text-primary">44k/month</span>
            </p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[280px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">October Bookings</p>
            <p className="text-4xl font-semibold">
              {data?.data.filter(booking => {
                const bookingDate = new Date(booking.startAt || new Date());
                return bookingDate.getMonth() === 9; // October is month 9
              }).length || 0}
            </p>
            <p className="text-xs">
              <span className="text-green-500">+10% </span>Last month
            </p>
          </div>
          <div className="w-32 h-20">
            <ChartBarDefault />
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-6 min-w-[400px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md ">Birthdays</p>
            <p className="text-4xl font-semibold flex items-center">
              112 <Dot className="text-orange-500 size-12 -ml-3" />
            </p>
            <p className="text-xs">43% of total booking</p>
          </div>
          <div className="h-16 border-1"></div>
          <div className="flex flex-col">
            <p className="text-md">Weddings</p>
            <p className="text-4xl font-semibold flex items-center">
              72 <Dot className="text-teal-500 size-12 -ml-3" />
            </p>
            <p className="text-xs">32% of total booking</p>
          </div>
          <div className="h-16 border-1"></div>
          <div className="flex flex-col">
            <p className="text-md">Seminars</p>
            <p className="text-4xl font-semibold flex items-center">
              17 <Dot className="text-cyan-500 size-12 -ml-3" />
            </p>
            <p className="text-xs">13% of total booking</p>
          </div>
          <div className="flex flex-col">
            <div className="w-24 h-fit">
              <ChartPieSimple />
            </div>
          </div>
        </div>

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
