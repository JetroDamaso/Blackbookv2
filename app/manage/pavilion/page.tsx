"use client";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Castle, Dot, HandCoins, Notebook } from "lucide-react";
import { ChartPieSimple } from "@/components/Charts/EventDistribution";
import { ChartBarDefault } from "@/components/Charts/TotalBookingsChart";

export default function ManagePavilion() {
  const { isPending, error, data } = useQuery({
    queryKey: ["allPavilions"],
    queryFn: () => getAllPavilions(),
  });

  const handleRowClick = (pavilionId: number) => {
    console.log("Clicked pavilion:", pavilionId);
    // TODO: Add pavilion dialog or detail view
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
        <div className="text-center text-red-500">
          Error loading pavilions: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="-mb-18 bg-muted overflow-hidden">
        <SidebarProvider className="overflow-hidden">
          <AppSidebar className="mt-4" />
          <SidebarInset>
            <header className=" overflow-hidden bg-muted flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1 block md:hidden" />
                <p className="font-semibold text-lg flex items-center gap-2">
                  <Castle size={18} /> <span>Clients</span>
                </p>
              </div>
            </header>

            <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
              <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
                <div className="flex flex-col">
                  <p className="text-md">Total Bookings</p>
                  <p className="text-4xl font-semibold">{data?.length || 0}</p>
                  <p className="text-xs">
                    Average <span className="text-primary">20/month</span>
                  </p>
                </div>
              </div>

              <div className="flex rounded-md p-4 bg-white border-1 items-center gap-6 min-w-[400px] flex-shrink-0">
                <div className="flex flex-col">
                  <p className="text-md ">Grand Pavilion</p>
                  <p className="text-4xl font-semibold flex items-center">
                    112 <Dot className="text-orange-500 size-12 -ml-3" />
                  </p>
                  <p className="text-xs">43% of total booking</p>
                </div>
                <div className="h-16 border-1"></div>
                <div className="flex flex-col">
                  <p className="text-md">Mini Pavilion</p>
                  <p className="text-4xl font-semibold flex items-center">
                    72 <Dot className="text-teal-500 size-12 -ml-3" />
                  </p>
                  <p className="text-xs">32% of total booking</p>
                </div>
                <div className="h-16 border-1"></div>
                <div className="flex flex-col">
                  <p className="text-md">Floating</p>
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

              {/* <div className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer">
              <Table className="size-9 grow" />
              <p className="text-sm select-none">Table View</p>
            </div> */}
            </div>

            <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
              <DataTable
                columns={columns}
                data={data || []}
                onRowClick={handleRowClick}
              />
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
