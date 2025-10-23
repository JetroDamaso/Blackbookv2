"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllAdditionalCharges } from "@/server/additionalcharge/pullActions";
import { DollarSign } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

export default function ManageAdditionalCharges() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { isPending, error, data } = useQuery({
    queryKey: ["allAdditionalCharges"],
    queryFn: () => getAllAdditionalCharges(),
  });

  const handleRowClick = (id: number) => {
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedId(null);
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
          Error loading additional charges: {error.message}
        </div>
      </div>
    );
  }

  const totalAmount = data?.reduce((sum, charge) => sum + charge.amount, 0) || 0;

  return (
    <div>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2">
            <DollarSign size={18} /> <span>Additional Charges</span>
          </p>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Charges</p>
            <p className="text-4xl font-semibold">{data?.length || 0}</p>
            <p className="text-xs">
              Total value:{" "}
              <span className="text-primary">
                ₱
                {totalAmount.toLocaleString("en-PH", {
                  minimumFractionDigits: 2,
                })}
              </span>
            </p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Average Amount</p>
            <p className="text-4xl font-semibold">
              ₱{data?.length ? (totalAmount / data.length).toFixed(0) : "0"}
            </p>
            <p className="text-xs">Per charge</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable columns={columns} data={data || []} onRowClick={handleRowClick} />
      </div>
    </div>
  );
}
