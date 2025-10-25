"use client";
import { useQuery } from "@tanstack/react-query";
import { getAllPackages } from "@/server/Packages/pullActions";
import { getAllPavilions } from "@/server/Pavilions/Actions/pullActions";
import { Package, Building, DollarSign, Users } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";

export default function ManagePackages() {
  const [selectedPavilion, setSelectedPavilion] = useState<string>("all");
  const { data: session } = useSession();

  const {
    isPending: packagesPending,
    error: packagesError,
    data: packagesData,
  } = useQuery({
    queryKey: ["allPackages"],
    queryFn: () => getAllPackages(),
  });

  const {
    isPending: pavilionsPending,
    error: pavilionsError,
    data: pavilionsData,
  } = useQuery({
    queryKey: ["allPavilions"],
    queryFn: () => getAllPavilions(),
  });

  // Filter packages based on selected pavilion
  const filteredPackages = useMemo(() => {
    if (selectedPavilion === "all") {
      return packagesData || [];
    }
    return packagesData?.filter(pkg => pkg.pavilionId === parseInt(selectedPavilion)) || [];
  }, [packagesData, selectedPavilion]);

  // Calculate statistics
  const totalPackages = packagesData?.length || 0;
  const totalBookings =
    packagesData?.reduce((sum, pkg) => sum + (pkg.Booking?.length || 0), 0) || 0;
  const averagePrice = packagesData?.length
    ? packagesData.reduce((sum, pkg) => sum + pkg.price, 0) / packagesData.length
    : 0;

  // Render widgets based on user role
  const renderWidgets = () => {
    const userRole = session?.user?.role;

    // Owner widgets
    if (userRole === "Owner") {
      return (
        <>
          {/* Total Packages */}
          <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
            <div className="flex flex-col">
              <p className="text-md">Total Packages</p>
              <p className="text-4xl font-semibold">{totalPackages}</p>
              <p className="text-xs">Available packages</p>
            </div>
          </div>
        </>
      );
    }

    // Manager and Front Desk widgets (to be implemented)
    // For now, show default widget
    return (
      <>
        {/* Total Packages */}
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Packages</p>
            <p className="text-4xl font-semibold">{totalPackages}</p>
            <p className="text-xs">Available packages</p>
          </div>
        </div>
      </>
    );
  };

  if (packagesPending || pavilionsPending) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (packagesError || pavilionsError) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">
          Error loading packages: {packagesError?.message || pavilionsError?.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Package size={18} /> <span>Packages</span>
          </p>
          <Button variant={"outline"}>Edit Widgets</Button>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        {renderWidgets()}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable
          columns={columns}
          data={packagesData || []}
          selectedPavilion={selectedPavilion}
        />
      </div>
    </>
  );
}
