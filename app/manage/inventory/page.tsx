"use client";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllInventory } from "@/server/Inventory/Actions/pullActions";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Wine } from "lucide-react";

export default function ManageInventory() {
  const { isPending, error, data } = useQuery({
    queryKey: ["allInventory"],
    queryFn: () => getAllInventory(),
  });

  const handleRowClick = (inventoryId: number) => {
    console.log("Clicked inventory item:", inventoryId);
    // TODO: Add inventory item dialog or detail view
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
          Error loading inventory: {error.message}
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
                  <Wine size={18} /> <span>Inventory</span>
                </p>
              </div>
            </header>
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
