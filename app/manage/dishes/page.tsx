"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllDishes } from "@/server/Dishes/Actions/pullActions";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddDishDialog } from "./add-dish-dialog";

export default function ManageDishes() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<number | null>(null);

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["allDishes"],
    queryFn: () => getAllDishes(),
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
    refetch();
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
    </>
  );
}
