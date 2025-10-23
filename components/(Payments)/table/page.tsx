"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { getAllPayments } from "@/server/Billing & Payments/pullActions";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupButton,
} from "@/components/ui/input-group";
import { Dot, HandCoins, Notebook, SearchIcon, Users, UserSquareIcon } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "radix-ui";
import { Breadcrumb } from "react-aria-components";
import { ChartPieSimple } from "@/components/Charts/EventDistribution";
import { ChartBarDefault } from "@/components/Charts/TotalBookingsChart";

export default function ManagePayments() {
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { isPending, error, data } = useQuery({
    queryKey: ["allPayments"],
    queryFn: () => getAllPayments(),
  });

  const handleRowClick = (paymentId: number) => {
    setSelectedPaymentId(paymentId);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedPaymentId(null);
  };

  if (isPending) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center text-red-500">Error loading payments: {error.message}</div>
      </div>
    );
  }

  return <DataTable columns={columns} data={data || []} onRowClick={handleRowClick} />;
}
