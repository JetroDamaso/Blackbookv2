"use client";
import { ChartPieSimple } from "@/components/Charts/EventDistribution";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  getAllPavilionsPaginated,
  getPavilionStatistics,
} from "@/server/Pavilions/Actions/pullActions";
import { useQuery } from "@tanstack/react-query";
import { Castle, Dot, Notebook } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { AddPavilionDialog } from "./add-pavilion-dialog";

export default function ManagePavilion() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { data: session } = useSession();

  const { isPending, error, data } = useQuery({
    queryKey: ["allPavilions", currentPage],
    queryFn: () => getAllPavilionsPaginated(currentPage, pageSize),
  });

  // Fetch pavilion statistics
  const { data: stats } = useQuery({
    queryKey: ["pavilionStatistics"],
    queryFn: () => getPavilionStatistics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleRowClick = (pavilionId: number) => {
    // Optionally open a detail dialog or do something with the row
  };

  // Render widgets based on user role
  const renderWidgets = () => {
    const userRole = session?.user?.role;

    // Owner widgets
    if (userRole === "Owner") {
      // Get pavilion data sorted by booking count
      const pavilionData = stats?.pavilionStats || {};
      const sortedPavilions = Object.entries(pavilionData).sort((a, b) => b[1].count - a[1].count);
      const [pavilion1, pavilion2, pavilion3] = sortedPavilions.slice(0, 3);

      // Prepare data for pie chart
      const pieChartData = sortedPavilions.map(([name, data]) => ({
        eventType: name,
        count: data.count,
      }));

      return (
        <>
          {/* Total Pavilions */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Pavilions</p>
              <p className="text-4xl font-semibold">{stats?.totalPavilions || 0}</p>
              <p className="text-xs">
                Available <span className="text-primary">venues</span>
              </p>
            </div>
          </div>

          {/* Pavilion Booking Distribution */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-6 min-w-[400px] flex-shrink-0">
            {pavilion1 && (
              <>
                <div className="flex flex-col">
                  <p className="text-md">{pavilion1[0]}</p>
                  <p className="text-4xl font-semibold flex items-center">
                    {pavilion1[1].count} <Dot className="text-orange-500 size-12 -ml-3" />
                  </p>
                  <p className="text-xs">{pavilion1[1].percentage}% of total bookings</p>
                </div>
                {pavilion2 && (
                  <>
                    <div className="h-16 border-1"></div>
                    <div className="flex flex-col">
                      <p className="text-md">{pavilion2[0]}</p>
                      <p className="text-4xl font-semibold flex items-center">
                        {pavilion2[1].count} <Dot className="text-teal-500 size-12 -ml-3" />
                      </p>
                      <p className="text-xs">{pavilion2[1].percentage}% of total bookings</p>
                    </div>
                  </>
                )}
                {pavilion3 && (
                  <>
                    <div className="h-16 border-1"></div>
                    <div className="flex flex-col">
                      <p className="text-md">{pavilion3[0]}</p>
                      <p className="text-4xl font-semibold flex items-center">
                        {pavilion3[1].count} <Dot className="text-cyan-500 size-12 -ml-3" />
                      </p>
                      <p className="text-xs">{pavilion3[1].percentage}% of total bookings</p>
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

    // Manager and Front Desk widgets (to be implemented)
    // For now, show default widgets
    return (
      <>
        {/* Total Pavilions */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Pavilions</p>
            <p className="text-4xl font-semibold">{stats?.totalPavilions || 0}</p>
            <p className="text-xs">
              Available <span className="text-primary">venues</span>
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
        {renderWidgets()}

        {/* Action Widgets - Show for all roles */}
        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[120px] flex-shrink-0"
          onClick={() => (window.location.href = "/reports")}
        >
          <Notebook className="size-9 text-blue-600" />
          <p className="text-sm select-none">All Reports</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable columns={columns} data={data?.data || []} onRowClick={handleRowClick} />
      </div>
    </>
  );
}
