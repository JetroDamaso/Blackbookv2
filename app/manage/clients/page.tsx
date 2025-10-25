"use client";
import { ChartPieSimple } from "@/components/Charts/EventDistribution";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAllClientsPaginated, getClientStatistics } from "@/server/clients/pullActions";
import { useQuery } from "@tanstack/react-query";
import { Dot, HandCoins, Notebook, Users } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function ManageClients() {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { data: session } = useSession();

  const { isPending, error, data } = useQuery({
    queryKey: ["allClients", currentPage],
    queryFn: () => getAllClientsPaginated(currentPage, pageSize),
  });

  // Fetch client statistics
  const { data: stats } = useQuery({
    queryKey: ["clientStatistics"],
    queryFn: () => getClientStatistics(),
  });

  const handleRowClick = (clientId: number) => {
    setSelectedClientId(clientId);
    setIsDialogOpen(true);
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
          {/* Total Clients */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Clients</p>
              <p className="text-4xl font-semibold">{stats?.totalClients || 0}</p>
              <p className="text-xs">
                <span className="text-primary">{stats?.totalClients || 0}</span> active clients
              </p>
            </div>
          </div>

          {/* New Clients/Month */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">New Clients/Month</p>
              <p className="text-4xl font-semibold flex">{stats?.newClientsThisMonth || 0}</p>
              <p className="text-xs">
                Average{" "}
                <span className="text-primary">{stats?.averageNewClientsPerMonth || 0}/month</span>
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
                  <p className="text-xs">{eventType1[1].percentage}% of total clients</p>
                </div>
                {eventType2 && (
                  <>
                    <div className="h-16 border-1"></div>
                    <div className="flex flex-col">
                      <p className="text-md">{eventType2[0]}</p>
                      <p className="text-4xl font-semibold flex items-center">
                        {eventType2[1].count} <Dot className="text-teal-500 size-12 -ml-3" />
                      </p>
                      <p className="text-xs">{eventType2[1].percentage}% of total clients</p>
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
                      <p className="text-xs">{eventType3[1].percentage}% of total clients</p>
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
        {/* Total Clients */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Clients</p>
            <p className="text-4xl font-semibold">{stats?.totalClients || 0}</p>
            <p className="text-xs">
              <span className="text-primary">{stats?.totalClients || 0}</span> active clients
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
        <div className="text-center text-red-500">Error loading clients: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Users size={18} /> <span>Clients</span>
          </p>
          <Button variant={"outline"}>Edit Widgets</Button>
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
        <DataTable columns={columns} data={data?.data || []} onRowClick={handleRowClick} />
      </div>
    </>
  );
}
