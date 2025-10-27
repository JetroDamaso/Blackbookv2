"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// Define the booking type with relations
type BookingWithRelations = Awaited<
  ReturnType<typeof import("@/server/Booking/pullActions").getAllBookings>
>[number];

export const columns: ColumnDef<BookingWithRelations>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <div onClick={e => e.stopPropagation()}>
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "eventName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Event Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue("eventName")}</div>;
    },
  },
  {
    accessorKey: "client",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Client Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const client = row.original.client;
      return client ? `${client.firstName} ${client.lastName}` : "No client assigned";
    },
  },
  {
    accessorKey: "pavilion",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Pavilion
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const pavilion = row.original.pavilion;
      return pavilion?.name || "No pavilion assigned";
    },
  },
  {
    id: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status = row.original.status || 0;

      // Status mapping: 1=Pending, 2=Confirmed, 3=In Progress, 4=Completed, 5=Unpaid, 6=Canceled, 7=Archived, 8=Draft
      const statusConfig: Record<
        number,
        { text: string; variant: "default" | "secondary" | "destructive" | "outline" }
      > = {
        1: { text: "Pending", variant: "outline" },
        2: { text: "Confirmed", variant: "default" },
        3: { text: "In Progress", variant: "default" },
        4: { text: "Completed", variant: "secondary" },
        5: { text: "Unpaid", variant: "destructive" },
        6: { text: "Canceled", variant: "destructive" },
        7: { text: "Archived", variant: "secondary" },
        8: { text: "Draft", variant: "outline" },
      };

      const config = statusConfig[status] || { text: "Unknown", variant: "outline" };

      return <Badge variant={config.variant}>{config.text}</Badge>;
    },
  },
  {
    accessorKey: "startAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Start Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("startAt") as Date;
      return date ? new Date(date).toLocaleDateString() : "Not set";
    },
  },
  {
    accessorKey: "endAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          End Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = row.getValue("endAt") as Date;
      return date ? new Date(date).toLocaleDateString() : "Not set";
    },
  },
  {
    accessorKey: "totalPax",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Total Pax
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <div className="text-center">{row.getValue("totalPax")}</div>;
    },
  },
  {
    id: "balance",
    accessorFn: row => row.billing?.balance ?? 0,
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Balance
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const balance = row.original.billing?.balance ?? 0;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "PHP",
      }).format(balance);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
];
