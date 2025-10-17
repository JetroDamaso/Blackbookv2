"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllRooms } from "@/server/rooms/pullActions";
import { Hotel, Bed, Users, Calendar } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";

export default function ManageRooms() {
  const { isPending, error, data } = useQuery({
    queryKey: ["allRooms"],
    queryFn: () => getAllRooms(),
  });

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
        <div className="text-center text-red-500">
          Error loading rooms: {error.message}
        </div>
      </div>
    );
  }

  const totalCapacity =
    data?.reduce((sum, room) => sum + room.capacity, 0) || 0;

  const averageCapacity = data?.length
    ? Math.round(totalCapacity / data.length)
    : 0;

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Hotel size={18} /> <span>Rooms</span>
          </p>
          <Button variant={"outline"}>Edit Widgets</Button>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Rooms</p>
            <p className="text-4xl font-semibold">{data?.length || 0}</p>
            <p className="text-xs">Available rooms</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Capacity</p>
            <p className="text-4xl font-semibold">{totalCapacity}</p>
            <p className="text-xs">People capacity</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Average Capacity</p>
            <p className="text-4xl font-semibold">{averageCapacity}</p>
            <p className="text-xs">Per room</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md flex items-center gap-1">
              <Calendar size={16} /> Availability
            </p>
            <p className="text-2xl font-semibold text-green-600">Available</p>
            <p className="text-xs">Ready for booking</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable columns={columns} data={data || []} />
      </div>
    </>
  );
}
