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
        <div className="text-center text-red-500">Error loading event types: {error.message}</div>
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
         
        </div>
      </header>


      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable columns={columns} data={data || []} />
      </div>
    </>
  );
}
