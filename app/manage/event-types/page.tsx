"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllEventTypes } from "@/server/eventtypes/pullActions";
import { Calendar as CalendarIcon, Cake, Heart, Users } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";

export default function ManageEventTypes() {
  const { isPending, error, data } = useQuery({
    queryKey: ["allEventTypes"],
    queryFn: () => getAllEventTypes(),
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
          Error loading event types: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <CalendarIcon size={18} /> <span>Event Types</span>
          </p>
          <Button variant={"outline"}>Edit Widgets</Button>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Event Types</p>
            <p className="text-4xl font-semibold">{data?.length || 0}</p>
            <p className="text-xs">Available event categories</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Most Popular</p>
            <p className="text-4xl font-semibold flex items-center gap-2">
              <Cake size={20} className="text-orange-500" /> Birthday
            </p>
            <p className="text-xs">43% of bookings</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Second Most</p>
            <p className="text-4xl font-semibold flex items-center gap-2">
              <Heart size={20} className="text-pink-500" /> Wedding
            </p>
            <p className="text-xs">32% of bookings</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable columns={columns} data={data || []} />
      </div>
    </>
  );
}
