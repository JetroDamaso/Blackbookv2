"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllDiscounts } from "@/server/discount/pullActions";
import { Percent } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function ManageDiscounts() {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { isPending, error, data } = useQuery({
    queryKey: ["allDiscounts"],
    queryFn: () => getAllDiscounts(),
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
          Error loading discounts: {error.message}
        </div>
      </div>
    );
  }

  const averageDiscount = data?.length
    ? (
        data.reduce((sum, discount) => sum + discount.percent, 0) / data.length
      ).toFixed(1)
    : "0";

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
                  <Percent size={18} /> <span>Discounts</span>
                </p>
              </div>
            </header>

            <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
              <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
                <div className="flex flex-col">
                  <p className="text-md">Total Discounts</p>
                  <p className="text-4xl font-semibold">{data?.length || 0}</p>
                  <p className="text-xs">Available discount types</p>
                </div>
              </div>

              <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
                <div className="flex flex-col">
                  <p className="text-md">Average Discount</p>
                  <p className="text-4xl font-semibold">{averageDiscount}%</p>
                  <p className="text-xs">Across all types</p>
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
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
