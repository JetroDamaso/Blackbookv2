"use client";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllDishes } from "@/server/Dishes/Actions/pullActions";
import { getAllMenuPackages } from "@/server/menuPackages/pullActions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UtensilsCrossed, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddDishDialog } from "./add-dish-dialog";
import { ManagePackagesDialog } from "./manage-packages-dialog";

export default function ManageDishes() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<number | null>(null);
  const [isManagePackagesOpen, setIsManagePackagesOpen] = useState(false);
  const queryClient = useQueryClient();

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["allDishes"],
    queryFn: () => getAllDishes(),
  });

  const { data: menuPackagesData, refetch: refetchPackages } = useQuery({
    queryKey: ["menuPackages"],
    queryFn: () => getAllMenuPackages(),
  });

  const handleRowClick = (dishId: number) => {
    setSelectedDish(dishId);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setSelectedDish(null);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["allDishes"] });
    handleCloseDialog();
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
        <div className="text-center text-red-500">Error loading dishes: {error.message}</div>
      </div>
    );
  }

  // Calculate dish stats
  const totalDishes = data?.length || 0;

  // Calculate menu package stats
  const totalPackages = menuPackagesData?.length || 0;

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <UtensilsCrossed size={18} /> <span>Dishes</span>
          </p>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Dishes</p>
            <p className="text-4xl font-semibold">{totalDishes}</p>
            <p className="text-xs">
              Available <span className="text-primary">dishes</span>
            </p>
          </div>
        </div>

        {/* Manage Packages Widget */}
        <div
          className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0 cursor-pointer hover:bg-accent transition-colors"
          onClick={() => setIsManagePackagesOpen(true)}
        >
          <div className="flex flex-col grow">
            <p className="text-md flex items-center gap-2">
              <Package size={16} />
              <span>Manage Packages</span>
            </p>
            <p className="text-4xl font-semibold">{totalPackages}</p>
            <p className="text-xs">
              Click to <span className="text-primary">manage menu packages</span>
            </p>
          </div>
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

      <AddDishDialog
        open={isAddDialogOpen}
        onClose={handleCloseDialog}
        onSuccess={handleSuccess}
        dishId={selectedDish}
      />

      <ManagePackagesDialog
        open={isManagePackagesOpen}
        onClose={() => setIsManagePackagesOpen(false)}
        onRefresh={refetchPackages}
      />
    </>
  );
}
