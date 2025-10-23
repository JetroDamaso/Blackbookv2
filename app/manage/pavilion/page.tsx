"use client";
import { ChartPieSimple } from "@/components/Charts/EventDistribution";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAllPavilionsPaginated } from "@/server/Pavilions/Actions/pullActions";
import { useQuery } from "@tanstack/react-query";
import { Castle, Dot, Notebook } from "lucide-react";
import { useState } from "react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { AddPavilionDialog } from "./add-pavilion-dialog";

export default function ManagePavilion() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { isPending, error, data } = useQuery({
    queryKey: ["allPavilions", currentPage],
    queryFn: () => getAllPavilionsPaginated(currentPage, pageSize),
  });

  const handleRowClick = (pavilionId: number) => {
    // Optionally open a detail dialog or do something with the row
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
        <div className="text-center text-red-500">Error loading pavilions: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Castle size={18} /> <span>Pavilions</span>
          </p>

        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Pavilions</p>
            <p className="text-4xl font-semibold">{data?.pagination?.totalCount || 0}</p>
            <p className="text-xs">
              Available <span className="text-primary">venues</span>
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
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable
          columns={columns}
          data={data?.data || []}
          onRowClick={handleRowClick}
          pagination={data?.pagination}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}
