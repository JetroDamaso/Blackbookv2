"use client";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getAllEmployeesPaginated } from "@/server/employee/pullActions";
import { useQuery } from "@tanstack/react-query";
import { UserCheck } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { columns } from "./columns";
import { DataTable } from "./data-table";

export default function ManageEmployees() {
  const { data: session } = useSession();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { isPending, error, data } = useQuery({
    queryKey: ["allEmployees", currentPage],
    queryFn: () => getAllEmployeesPaginated(currentPage, pageSize),
  });

  const handleRowClick = (id: number) => {
    setSelectedId(id);
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
        <div className="text-center text-red-500">Error loading employees: {error.message}</div>
      </div>
    );
  }

  const activeEmployees = data?.data.filter(emp => emp.isActive).length || 0;
  const inactiveEmployees = data?.data.filter(emp => !emp.isActive).length || 0;

  const renderWidgets = () => {
    if (session?.user?.role === "Owner") {
      return (
        <>
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Employees</p>
              <p className="text-4xl font-semibold">{data?.pagination.totalCount || 0}</p>
              <p className="text-xs">All registered employees</p>
            </div>
          </div>

          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Active Employees</p>
              <p className="text-4xl font-semibold">{activeEmployees}</p>
              <p className="text-xs">Currently working</p>
            </div>
          </div>

          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Inactive Employees</p>
              <p className="text-4xl font-semibold">{inactiveEmployees}</p>
              <p className="text-xs">No longer active</p>
            </div>
          </div>
        </>
      );
    }
    return null;
  };

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <UserCheck size={18} /> <span>Employees</span>
          </p>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        {renderWidgets()}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable columns={columns} data={data?.data || []} onRowClick={handleRowClick} />
      </div>
    </>
  );
}
