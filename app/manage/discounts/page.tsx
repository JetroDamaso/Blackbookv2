"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllDiscounts } from "@/server/discount/pullActions";
import { Percent, Tag, TrendingDown } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

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
        <div className="text-center text-red-500">Error loading discounts: {error.message}</div>
      </div>
    );
  }

  // Calculate statistics for both percentage and fixed amount discounts
  const percentageDiscounts = data?.filter(discount => discount.percent !== null) || [];
  const fixedAmountDiscounts = data?.filter(discount => discount.amount !== null) || [];

  const averageDiscount = percentageDiscounts.length
    ? (
        percentageDiscounts.reduce((sum, discount) => sum + (discount.percent || 0), 0) /
        percentageDiscounts.length
      ).toFixed(1)
    : "0";

  // Find maximum percentage discount
  const maxDiscount = percentageDiscounts.length
    ? Math.max(...percentageDiscounts.map(d => d.percent || 0))
    : 0;

  // Find maximum fixed amount discount
  const maxFixedDiscount = fixedAmountDiscounts.length
    ? Math.max(...fixedAmountDiscounts.map(d => d.amount || 0))
    : 0;

  return (
    <>
      <header className="bg-white mb-4 border-b-1 overflow-hidden flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger className="-ml-1 block md:hidden" />
          <p className="font-semibold text-lg flex items-center gap-2 grow">
            <Percent size={18} /> <span>Discounts</span>
          </p>
        </div>
      </header>

      <div className="bg-muted flex flex-wrap gap-2 px-4 pb-2 overflow-x-auto">
        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Total Discounts</p>
            <p className="text-4xl font-semibold">{data?.length || 0}</p>
            <p className="text-xs">
              {percentageDiscounts.length} percentage, {fixedAmountDiscounts.length} fixed
            </p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Avg % Discount</p>
            <p className="text-4xl font-semibold">{averageDiscount}%</p>
            <p className="text-xs">Percentage-based only</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Max % Discount</p>
            <p className="text-4xl font-semibold text-green-600">{maxDiscount}%</p>
            <p className="text-xs">Highest percentage</p>
          </div>
        </div>

        <div className="flex rounded-md p-4 bg-white border-1 items-center gap-2 min-w-[200px] flex-shrink-0">
          <div className="flex flex-col">
            <p className="text-md">Max Fixed Amount</p>
            <p className="text-4xl font-semibold text-blue-600">
              ₱{maxFixedDiscount.toLocaleString()}
            </p>
            <p className="text-xs">Highest fixed discount</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted overflow-hidden">
        <DataTable columns={columns} data={data || []} onRowClick={handleRowClick} />
      </div>
    </>
  );
}
