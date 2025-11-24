"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllInventory } from "@/server/Inventory/Actions/pullActions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Wine, AlertTriangle, Package, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddInventoryDialog } from "./add-inventory-dialog";
import { ManageCategoriesDialog } from "./manage-categories-dialog";

export default function ManageInventory() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);
  const [selectedInventoryId, setSelectedInventoryId] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["allInventory"],
    queryFn: () => getAllInventory(),
  });

  const handleRowClick = (inventoryId: number) => {
    setSelectedInventoryId(inventoryId);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setSelectedInventoryId(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["allInventory"] });
    handleCloseDialog();
  };

  const handleCategoriesSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["allInventory"] });
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
        <div className="text-center text-red-500">Error loading inventory: {error.message}</div>
      </div>
    );
  }

  // Calculate inventory stats
  const totalItems = data?.length || 0;

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Wine size={18} /> <span>Inventory</span>
          </p>
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

        {/* Manage Categories Widget */}
        <div
          className="flex flex-col rounded-md p-4 bg-white border-1 items-center gap-2 justify-center cursor-pointer hover:bg-gray-50 transition-colors min-w-[140px] flex-shrink-0"
          onClick={() => setIsCategoriesDialogOpen(true)}
        >
          <FolderKanban className="size-9 text-blue-600" />
          <p className="text-sm select-none">Manage Categories</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable
          columns={columns}
          data={data || []}
          onRowClick={handleRowClick}
          onAddNew={() => setIsAddDialogOpen(true)}
        />
      </div>

      <AddInventoryDialog
        open={isAddDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        inventoryId={selectedInventoryId}
      />

      <ManageCategoriesDialog
        open={isCategoriesDialogOpen}
        onClose={() => setIsCategoriesDialogOpen(false)}
        onSuccess={handleCategoriesSuccess}
      />
    </>
  );
}
