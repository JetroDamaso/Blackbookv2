"use client";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllInventory } from "@/server/Inventory/Actions/pullActions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Wine, AlertTriangle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

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

  // Calculate inventory stats
  const totalItems = data?.length || 0;
  const lowStockItems = data?.filter((item) => item.quantity < 10).length || 0;
  const totalQuantity =
    data?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Wine size={18} /> <span>Inventory</span>
          </p>
          <Button variant={"outline"}>Edit Widgets</Button>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Items</p>
            <p className="text-4xl font-semibold">{totalItems}</p>
            <p className="text-xs">
              In <span className="text-primary">inventory</span>
            </p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Low Stock Alert</p>
            <p className="text-4xl font-semibold text-orange-500">
              {lowStockItems}
            </p>
            <p className="text-xs">
              Items <span className="text-orange-500">below 10</span>
            </p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Quantity</p>
            <p className="text-4xl font-semibold">{totalQuantity}</p>
            <p className="text-xs">
              Items <span className="text-primary">in stock</span>
            </p>
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
