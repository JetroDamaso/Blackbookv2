"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllEmployees } from "@/server/employee/pullActions";
import { UserCheck } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export default function ManageEmployees() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { isPending, error, data } = useQuery({
    queryKey: ["allEmployees"],
    queryFn: () => getAllEmployees(),
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
        <div className="text-center text-red-500">
          Error loading employees: {error.message}
        </div>
      </div>
    );
  }

  const activeEmployees = data?.filter((emp) => emp.isActive).length || 0;
  const inactiveEmployees = data?.filter((emp) => !emp.isActive).length || 0;

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <UserCheck size={18} /> <span>Employees</span>
          </p>
          <Button variant={"outline"}>Edit Widgets</Button>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Employees</p>
            <p className="text-4xl font-semibold">{data?.length || 0}</p>
            <p className="text-xs">All registered staff</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Active</p>
            <p className="text-4xl font-semibold text-green-600">
              {activeEmployees}
            </p>
            <p className="text-xs">Currently working</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Inactive</p>
            <p className="text-4xl font-semibold text-red-600">
              {inactiveEmployees}
            </p>
            <p className="text-xs">Not active</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable
          columns={columns}
          data={data || []}
          onRowClick={handleRowClick}
        />
      </div>
    </>
  );
}
